# SPDX-FileCopyrightText: Copyright (C) ARDUINO SRL (http://www.arduino.cc)
#
# SPDX-License-Identifier: MPL-2.0

from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI
from arduino.app_bricks.video_objectdetection import VideoObjectDetection
from datetime import datetime, UTC
import random

ui = WebUI()
detection_stream = VideoObjectDetection(confidence=0.2, debounce_sec=1.5)

ui.on_message("override_th", lambda sid, threshold: detection_stream.override_threshold(threshold))

# Example usage: Register a callback for when all objects are detected
# def send_detections_to_ui(detections: dict):
#   for key, values in detections.items():
#     for value in values:
#       entry = {
#         "content": key,
#         "confidence": value.get("confidence"),
#         "timestamp": datetime.now(UTC).isoformat()
#       }    
#       ui.send_message("detection", message=entry)

def send_confidence_to_ui(detections: dict):

    # read ambient light value.
    brightness = Bridge.call('light')
    temperature = Bridge.call('temperature')
    
    for key, values in detections.items():
        for value in values:
            entry = {
                "alertnessScore": int(value.get("confidence")*100),
                "brightness": brightness,
                "temperature": int(temperature),
                "blinkRate": int(random.randint(10, 30)),
                "eyeClosed": random.choice([0] + [1]*4),
                "timestamp": datetime.now(UTC).isoformat()
            }
            ui.send_message("metrics", message=entry)
            print(entry)

detection_stream.on_detect_all(send_confidence_to_ui)

App.run()
