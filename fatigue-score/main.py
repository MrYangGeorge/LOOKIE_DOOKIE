from arduino.app_utils import App
from arduino.app_bricks.web_ui import WebUI
from arduino.app_bricks.video_objectdetection import VideoObjectDetection
from datetime import datetime, UTC

import cv2
import numpy as np

# --- tfline-runtime PoseNet ---
from tfline_runtime.models.posenet import PoseNetRunner


# --- Initialize UI and detection stream ---
ui = WebUI()
detection_stream = VideoObjectDetection(confidence=0.5, debounce_sec=0.0)

ui.on_message("override_th", lambda sid, threshold: detection_stream.override_threshold(threshold))


# --- Initialize PoseNet (tfline-runtime) ---
posenet = PoseNetRunner(model="resnet50")  # or mobilenet depending on what you want
posenet.load()


# --- Callback for detected objects (faces) ---
def send_detections_to_ui(detections: dict):
    for key, values in detections.items():
        for value in values:
            entry = {
                "content": key,
                "confidence": value.get("confidence"),
                "timestamp": datetime.now(UTC).isoformat()
            }
            ui.send_message("detection", message=entry)

detection_stream.on_detect_all(send_detections_to_ui)


# --- Draw PoseNet skeleton ---
POSE_CONNECTIONS = [
    ("leftShoulder", "rightShoulder"),
    ("leftShoulder", "leftElbow"),
    ("leftElbow", "leftWrist"),
    ("rightShoulder", "rightElbow"),
    ("rightElbow", "rightWrist"),
    ("leftShoulder", "leftHip"),
    ("rightShoulder", "rightHip"),
    ("leftHip", "rightHip"),
    ("leftHip", "leftKnee"),
    ("leftKnee", "leftAnkle"),
    ("rightHip", "rightKnee"),
    ("rightKnee", "rightAnkle"),
    ("nose", "leftEye"),
    ("nose", "rightEye"),
]

def draw_keypoints(frame, keypoints):
    h, w, _ = frame.shape

    # Draw joints
    for name, (x, y, score) in keypoints.items():
        if score > 0.4:
            cx, cy = int(x * w), int(y * h)
            cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)

    # Draw bones
    for a, b in POSE_CONNECTIONS:
        if a in keypoints and b in keypoints:
            xa, ya, sa = keypoints[a]
            xb, yb, sb = keypoints[b]
            if sa > 0.4 and sb > 0.4:
                pa = (int(xa * w), int(ya * h))
                pb = (int(xb * w), int(yb * h))
                cv2.line(frame, pa, pb, (255, 0, 0), 2)


# --- Callback for processing each video frame ---
def process_frame(frame):
    """
    Input: BGR frame from video
    Output: frame with overlaid pose landmarks
    """

    # PoseNet expects RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Run PoseNet
    poses = posenet.infer(rgb_frame)

    # PoseNet usually returns a list (multi-person), take first
    if poses:
        pose = poses[0]
        keypoints = pose["keypoints"]  
        # expected format:
        # {
        #   "nose": (x, y, score),
        #   "leftShoulder": (x, y, score),
        #   ...
        # }

        draw_keypoints(frame, keypoints)

        # Optional: extract keypoints for downstream logic
        kp_list = []
        for name, (x, y, score) in keypoints.items():
            kp_list.append([name, x, y, score])

        # Example if you want to send them
        # ui.send_message("pose_keypoints", message=kp_list)

    return frame


# --- Integrate frame processing into detection stream ---
detection_stream.on_frame(process_frame)


# --- Run the App ---
App.run()