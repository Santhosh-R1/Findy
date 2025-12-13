import os
import sys
import json
import numpy as np

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
tf.get_logger().setLevel('ERROR')

from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
from tensorflow.keras.preprocessing import image
from sklearn.metrics.pairwise import cosine_similarity

# Load MobileNetV2 model
try:
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        pooling='avg'
    )
except Exception as e:
    print(json.dumps({'error': f"Failed to load model: {str(e)}"}))
    sys.exit(1)


def extract_features(img_path):
    """Load image and extract feature vector using MobileNetV2"""
    try:
        if not os.path.exists(img_path):
            return None, f"File not found: {img_path}"

        img = image.load_img(img_path, target_size=(224, 224))
        img_data = image.img_to_array(img)
        img_data = np.expand_dims(img_data, axis=0)
        img_data = preprocess_input(img_data)

        features = base_model.predict(img_data, verbose=0)
        return features, None

    except Exception as e:
        return None, str(e)


def match_images():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({'error': 'No input provided'}))
            return

        try:
            input_data = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            print(json.dumps({'error': 'Invalid JSON format'}))
            return

        path_a = input_data.get('lostImage')
        path_b = input_data.get('foundImage')

        if not path_a or not path_b:
            print(json.dumps({'error': 'Missing image paths'}))
            return

        feat_a, err_a = extract_features(path_a)
        if feat_a is None:
            print(json.dumps({'error': f"Error processing Lost Image: {err_a}"}))
            return

        feat_b, err_b = extract_features(path_b)
        if feat_b is None:
            print(json.dumps({'error': f"Error processing Found Image: {err_b}"}))
            return

        similarity_score = cosine_similarity(feat_a, feat_b)[0][0]
        score = float(similarity_score)

        threshold = 0.75
        is_match = score >= threshold

        result = {
            'success': True,
            'score': round(score * 100, 2),
            'is_match': is_match,
            'message': "High similarity found" if is_match else "Low similarity"
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({'error': f"Unexpected script error: {str(e)}"}))


if __name__ == "__main__":
    match_images()
