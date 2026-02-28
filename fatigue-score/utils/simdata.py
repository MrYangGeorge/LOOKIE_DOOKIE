import numpy as np
import random

def generate_dummy_frame(t):
    """
    t = time step (0,1,2,...)
    returns: keypoints dict + eye_open bool
    """

    # Base skeleton (upright)
    leftShoulder = np.array([300, 300])
    rightShoulder = np.array([340, 300])
    leftHip = np.array([305, 380])
    rightHip = np.array([335, 380])

    shoulder_mid = (leftShoulder + rightShoulder) / 2

    # Fatigue progression (0 → 1 over time)
    fatigue_factor = min(t / 300, 1.0)

    # Head drifts forward and down with fatigue
    nose_x = shoulder_mid[0] + fatigue_factor * 25 + np.random.randn() * 1.5
    nose_y = shoulder_mid[1] - 60 + fatigue_factor * 20 + np.random.randn() * 1.5
    nose = np.array([nose_x, nose_y])

    # Add small torso tilt with fatigue
    hip_mid = (leftHip + rightHip) / 2
    torso_shift = fatigue_factor * 10
    leftHip_mod = leftHip + np.array([0, torso_shift])
    rightHip_mod = rightHip + np.array([0, torso_shift])

    keypoints = {
        "nose": tuple(nose),
        "leftShoulder": tuple(leftShoulder),
        "rightShoulder": tuple(rightShoulder),
        "leftHip": tuple(leftHip_mod),
        "rightHip": tuple(rightHip_mod)
    }

    # Eye logic
    if fatigue_factor < 0.4:
        eye_open = True
    elif fatigue_factor < 0.7:
        eye_open = random.random() > 0.1  # more blinks
    else:
        eye_open = random.random() > 0.4  # lots of closed frames

    return keypoints, eye_open