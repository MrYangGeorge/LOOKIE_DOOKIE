from utils.fatigue import FatigueModel

from utils.simdata import generate_dummy_frame

model = FatigueModel()

while True:
	# GET FROM CAMERA.
	# keypoints = {...}
	# eye_open = True/False

	for t in range(0, 500, 10):
		keypoints, eye_open = generate_dummy_frame(t=t) 
		fatigue, state = model.update(keypoints, eye_open)

		if fatigue is not None:
			print(f"Fatigue: {fatigue:.2f} | State: {state}")