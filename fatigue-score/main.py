from utils.pose import FatigueModel


model = FatigueModel()

while True:
    # GET FROM CAMERA.
    # keypoints = {...}
    # eye_open = True/False

    fatigue, state = model.update(keypoints, eye_open)

    if fatigue is not None:
        print(f"Fatigue: {fatigue:.2f} | State: {state}")