import numpy as np
import math


def midpoint(p1, p2):
    return np.array([(p1[0]+p2[0])/2, (p1[1]+p2[1])/2])

def dist(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))

def angle_with_vertical(vec):
    vertical = np.array([0, -1])  # screen coords: up is negative y
    cosang = np.dot(vec, vertical) / (np.linalg.norm(vec)*np.linalg.norm(vertical) + 1e-6)
    return np.degrees(np.arccos(np.clip(cosang, -1, 1)))

def sigmoid(x):
    return 1 / (1 + np.exp(-x))