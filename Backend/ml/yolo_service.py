import os
import requests
from ultralytics import YOLO

# ================== PATHS ==================
BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "best.pt")

# ✅ CONFIRMED WORKING PUBLIC OBJECT URL
SUPABASE_MODEL_URL = "https://rgejpuecsrsdepoxkhaw.supabase.co/storage/v1/object/public/ml%20-%20models/best.pt"

# ================== MODEL SINGLETON ==================
_model = None


def ensure_model_exists():
    if os.path.exists(MODEL_PATH):
        return

    os.makedirs(MODEL_DIR, exist_ok=True)

    print("⬇️ Downloading best.pt model...")
    response = requests.get(SUPABASE_MODEL_URL, timeout=60)
    response.raise_for_status()

    with open(MODEL_PATH, "wb") as f:
        f.write(response.content)

    print("✅ Model downloaded")


def get_model():
    global _model

    if _model is None:
        ensure_model_exists()
        _model = YOLO(MODEL_PATH)

    return _model


def detect_on_image(image_path: str):
    model = get_model()
    results = model(image_path, conf=0.25)

    detections = []
    for r in results:
        if r.boxes is None:
            continue

        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = model.names[cls_id]

            detections.append({
                "label": label,
                "confidence": conf
            })

    return detections
