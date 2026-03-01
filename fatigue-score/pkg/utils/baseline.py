import numpy as np


class BaselineCalibrator:
    def __init__(self, window=150):
        self.window = window
        self.head_vals = []
        self.torso_vals = []
        self.shoulder_vals = []
        self.ready = False

    def update(self, head_fwd, torso_ang, shoulder_drop):
        if self.ready:
            return

        self.head_vals.append(head_fwd)
        self.torso_vals.append(torso_ang)
        self.shoulder_vals.append(shoulder_drop)

        if len(self.head_vals) >= self.window:
            self.baseline = {
                "head": np.mean(self.head_vals),
                "torso": np.mean(self.torso_vals),
                "shoulder": np.mean(self.shoulder_vals),
                "head_std": np.std(self.head_vals) + 1e-3,
                "torso_std": np.std(self.torso_vals) + 1e-3,
                "shoulder_std": np.std(self.shoulder_vals) + 1e-3,
            }
            self.ready = True
            print("Baseline calibrated.")