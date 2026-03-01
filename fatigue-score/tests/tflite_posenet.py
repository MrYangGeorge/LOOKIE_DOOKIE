import cv2
import numpy as np
import tflite_runtime.interpreter as tflite
import os

# ----------------------------
# CONFIG
# ----------------------------
MODEL_PATH = "mobilenet_v1_100_257x257_multi_kpt_stripped.tflite" 
IMAGE_DIR = "sample_images"  # folder containing images to process
OUTPUT_DIR = "output_images"
INPUT_SIZE = 257  # PoseNet input size

# PoseNet skeleton connections (17 keypoints)
POSE_CONNECTIONS = [
    (0,1),(0,2),(1,3),(2,4),(0,5),(0,6),(5,7),(7,9),
    (6,8),(8,10),(5,6),(5,11),(6,12),(11,12),(11,13),
    (13,15),(12,14),(14,16)
]

# ----------------------------
# INIT TFLITE INTERPRETER
# ----------------------------
interpreter = tflite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# ----------------------------
# HELPER FUNCTIONS
# ----------------------------
def preprocess_image(image_path):
    """Load image and resize to PoseNet input size"""
    img = cv2.imread(image_path)
    orig_shape = img.shape[:2]  # height, width
    img_resized = cv2.resize(img, (INPUT_SIZE, INPUT_SIZE))
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    input_data = np.expand_dims(img_rgb.astype(np.float32), axis=0)
    input_data = (input_data - 127.5) / 127.5  # normalize [-1,1]
    return img, input_data, orig_shape

def run_posenet(interpreter, input_data):
    """Run TFLite PoseNet inference"""
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    keypoints_with_scores = interpreter.get_tensor(output_details[0]['index'])
    return keypoints_with_scores[0]  # shape: (17,3) -> x, y, score

def overlay_keypoints(image, keypoints, orig_shape):
    """Draw keypoints and skeleton on image"""
    h, w = orig_shape
    for idx, (x, y, score) in enumerate(keypoints):
        if score > 0.2:  # only draw confident keypoints
            cx, cy = int(x * w), int(y * h)
            cv2.circle(image, (cx, cy), 3, (0,255,0), -1)

    # Draw skeleton lines
    for start, end in POSE_CONNECTIONS:
        if keypoints[start,2] > 0.2 and keypoints[end,2] > 0.2:
            x1, y1 = int(keypoints[start,0]*w), int(keypoints[start,1]*h)
            x2, y2 = int(keypoints[end,0]*w), int(keypoints[end,1]*h)
            cv2.line(image, (x1,y1), (x2,y2), (0,0,255), 2)

    return image

# ----------------------------
# MAIN LOOP
# ----------------------------
os.makedirs(OUTPUT_DIR, exist_ok=True)
image_files = [f for f in os.listdir(IMAGE_DIR) if f.lower().endswith((".jpg",".png"))]

for img_file in image_files:
    img_path = os.path.join(IMAGE_DIR, img_file)
    orig_img, input_data, orig_shape = preprocess_image(img_path)
    keypoints = run_posenet(interpreter, input_data)  # x, y, score
    output_img = overlay_keypoints(orig_img, keypoints, orig_shape)
    
    output_path = os.path.join(OUTPUT_DIR, img_file)
    cv2.imwrite(output_path, output_img)
    print(f"Processed {img_file}, saved to {output_path}")

print("Done! Check the output_images folder for results.")