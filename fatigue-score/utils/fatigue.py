from utils.math import midpoint, angle_with_vertical, sigmoid
from utils.baseline import BaselineCalibrator


import numpy as np
from collections import deque


def extract_posture_features(keypoints):
    nose = np.array(keypoints["nose"])
    l_sh = np.array(keypoints["leftShoulder"])
    r_sh = np.array(keypoints["rightShoulder"])
    l_hip = np.array(keypoints["leftHip"])
    r_hip = np.array(keypoints["rightHip"])

    shoulder_mid = midpoint(l_sh, r_sh)
    hip_mid = midpoint(l_hip, r_hip)

    torso_vec = shoulder_mid - hip_mid
    torso_length = np.linalg.norm(torso_vec) + 1e-6

    head_vec = nose - shoulder_mid

    head_forward = head_vec[0] / torso_length
    torso_angle = angle_with_vertical(torso_vec)
    shoulder_drop = (shoulder_mid[1] - nose[1]) / torso_length

    return head_forward, torso_angle, shoulder_drop


class EyeFatigue:
    def __init__(self, window=90):
        self.history = deque(maxlen=window)

    def update(self, eye_open):
        self.history.append(0 if eye_open else 1)

    def score(self):
        if len(self.history) == 0:
            return 0
        frac_closed = sum(self.history) / len(self.history)
        return np.clip(frac_closed / 0.4, 0, 1)
    

class FatigueModel:
    def __init__(self):
        self.baseline = BaselineCalibrator()
        self.eye_fatigue = EyeFatigue()
        self.fatigue_smoothed = 0.0
        self.alpha = 0.05

    def update(self, keypoints, eye_open):
        head_fwd, torso_ang, shoulder_drop = extract_posture_features(keypoints)

        # Baseline phase
        self.baseline.update(head_fwd, torso_ang, shoulder_drop)
        if not self.baseline.ready:
            return None, "CALIBRATING"

        b = self.baseline.baseline

        z_head = (head_fwd - b["head"]) / b["head_std"]
        z_torso = (torso_ang - b["torso"]) / b["torso_std"]
        z_shoulder = (shoulder_drop - b["shoulder"]) / b["shoulder_std"]

        z_head = np.clip(z_head, 0, 3)
        z_torso = np.clip(z_torso, 0, 3)
        z_shoulder = np.clip(z_shoulder, 0, 3)

        posture_fatigue = sigmoid(0.4*z_head + 0.4*z_torso + 0.2*z_shoulder)

        self.eye_fatigue.update(eye_open)
        ocular_fatigue = self.eye_fatigue.score()

        fatigue = 0.6*posture_fatigue + 0.4*ocular_fatigue

        self.fatigue_smoothed = self.alpha*fatigue + (1-self.alpha)*self.fatigue_smoothed

        state = self.classify(self.fatigue_smoothed)

        return self.fatigue_smoothed, state

    def classify(self, f):
        if f < 0.3:
            return "ALERT"
        elif f < 0.6:
            return "DROWSY"
        else:
            return "FATIGUED"