# import os
# import shutil

# # # -------- PATHS --------
# SOURCE_DIR = r"D:\Projects\Sahaay\YOLO_URBAN_ISSUES_DATASET\YOLO_URBAN_ISSUES_DATASET_SOURCE"
# YOLO_DIR   = r"D:\Projects\Sahaay\YOLO_URBAN_ISSUES_DATASET\YOLO_URBAN_ISSUES_DATASET"
# CLASSES = [
#     'Damaged concrete structures',
#     'DamagedElectricalPoles',
#     'DamagedRoadSigns',
#     'DeadAnimalsPollution',
#     'FallenTrees',
#     'Garbage',
#     'Graffitti',
#     'IllegalParking',
#     'Potholes and RoadCracks'
# ]

# SPLITS = ['train', 'valid', 'test']

# # -------- CREATE YOLO STRUCTURE --------
# for s in SPLITS:
#     os.makedirs(os.path.join(YOLO_DIR, 'images', s), exist_ok=True)
#     os.makedirs(os.path.join(YOLO_DIR, 'labels', s), exist_ok=True)

# copied_images = 0
# copied_labels = 0

# # -------- COPY DATA --------
# for class_id, cls in enumerate(CLASSES):
#     for split in SPLITS:

#         img_src = os.path.join(SOURCE_DIR, cls, split, 'images')
#         lbl_src = os.path.join(SOURCE_DIR, cls, split, 'labels')

#         img_dst = os.path.join(YOLO_DIR, 'images', split)
#         lbl_dst = os.path.join(YOLO_DIR, 'labels', split)

#         if not os.path.exists(img_src):
#             continue

#         for img in os.listdir(img_src):
#             if not img.lower().endswith(('.jpg', '.png', '.jpeg')):
#                 continue

#             base = os.path.splitext(img)[0]

#             # Copy image
#             shutil.copy(
#                 os.path.join(img_src, img),
#                 os.path.join(img_dst, img)
#             )
#             copied_images += 1

#             label_src_path = os.path.join(lbl_src, base + '.txt')
#             label_dst_path = os.path.join(lbl_dst, base + '.txt')

#             # Copy & remap label
#             if os.path.exists(label_src_path):
#                 with open(label_src_path, 'r') as f:
#                     lines = f.readlines()

#                 new_lines = []
#                 for line in lines:
#                     parts = line.strip().split()
#                     if len(parts) == 5:
#                         parts[0] = str(class_id)  # remap class
#                         new_lines.append(' '.join(parts))

#                 with open(label_dst_path, 'w') as f:
#                     f.write('\n'.join(new_lines) + '\n')

#                 copied_labels += 1
#             else:
#                 open(label_dst_path, 'w').close()  # empty label

# # -------- data.yaml --------
# yolo_path = YOLO_DIR.replace("\\", "/")
# with open(os.path.join(YOLO_DIR, 'data.yaml'), 'w') as f:
#     f.write(f"""
# train: {yolo_path}/images/train
# val: {yolo_path}/images/valid
# test: {yolo_path}/images/test
# nc: {len(CLASSES)}
# names: {CLASSES} """)

# print("DONE")
# print("Images copied:", copied_images)
# print("Labels copied:", copied_labels)

import os
import shutil

# -------- PATHS --------
SOURCE_DIR = r"D:\Projects\Sahaay\YOLO_URBAN_ISSUES_DATASET\YOLO_URBAN_ISSUES_DATASET_SOURCE"
YOLO_DIR   = r"D:\Projects\Sahaay\YOLO_URBAN_ISSUES_DATASET\YOLO_URBAN_ISSUES_DATASET"

CLASSES = [
    'Damaged concrete structures',
    'DamagedElectricalPoles',
    'DamagedRoadSigns',
    'DeadAnimalsPollution',
    'FallenTrees',
    'Garbage',
    'Graffitti',
    'IllegalParking',
    'Potholes and RoadCracks'
]

SPLITS = ['train', 'val', 'test']
IMG_EXTS = ('.jpg', '.jpeg', '.png')

# -------- CREATE YOLO STRUCTURE --------
for s in SPLITS:
    os.makedirs(os.path.join(YOLO_DIR, 'images', s), exist_ok=True)
    os.makedirs(os.path.join(YOLO_DIR, 'labels', s), exist_ok=True)

copied_images = 0
copied_labels = 0
placeholders = 0
not_found_examples = []

# helper: candidate label directories to check for a given class/split
def label_candidates(source_dir, cls, split):
    return [
        os.path.join(source_dir, cls, split, 'labels'),
        os.path.join(source_dir, cls, 'labels', split),
        os.path.join(source_dir, cls, 'labels'),
        os.path.join(source_dir, cls, split),
        os.path.join(source_dir, 'labels', split),
        os.path.join(source_dir, 'labels'),
    ]

# -------- COPY DATA (improved search) --------
for class_id, cls in enumerate(CLASSES):
    for split in SPLITS:

        img_src = os.path.join(SOURCE_DIR, cls, split, 'images')
        img_dst = os.path.join(YOLO_DIR, 'images', split)
        lbl_dst = os.path.join(YOLO_DIR, 'labels', split)

        if not os.path.exists(img_src):
            continue

        for img in os.listdir(img_src):
            if not img.lower().endswith(IMG_EXTS):
                continue

            base = os.path.splitext(img)[0]

            # Copy image
            src_img_path = os.path.join(img_src, img)
            dst_img_path = os.path.join(img_dst, img)
            # avoid accidental overwrite (shouldn't happen normally)
            if os.path.exists(dst_img_path):
                # add prefix to avoid collision
                dst_img_path = os.path.join(img_dst, f"{cls.replace(' ','_')}_{img}")
            shutil.copy2(src_img_path, dst_img_path)
            copied_images += 1

            # find label: search candidate label dirs for any file matching base.* (prefer .txt)
            found_label = False
            found_label_path = None
            for cand_dir in label_candidates(SOURCE_DIR, cls, split):
                if not cand_dir or not os.path.isdir(cand_dir):
                    continue
                # check for exact txt first
                txt_path = os.path.join(cand_dir, base + '.txt')
                if os.path.exists(txt_path):
                    found_label = True
                    found_label_path = txt_path
                    break
                # sometimes files have uppercase extensions or have .TXT etc.
                for ext in ('.TXT', '.Txt'):
                    p = os.path.join(cand_dir, base + ext)
                    if os.path.exists(p):
                        found_label = True
                        found_label_path = p
                        break
                if found_label:
                    break
                # fallback: search any file in cand_dir whose stem equals base (covers weird suffixes)
                for f in os.listdir(cand_dir):
                    fpath = os.path.join(cand_dir, f)
                    if not os.path.isfile(fpath):
                        continue
                    stem = os.path.splitext(f)[0]
                    if stem == base:
                        found_label = True
                        found_label_path = fpath
                        break
                if found_label:
                    break

            label_dst_path = os.path.join(lbl_dst, os.path.splitext(os.path.basename(dst_img_path))[0] + '.txt')

            if found_label and found_label_path:
                # process txt label (we only handle .txt content conversion here)
                try:
                    with open(found_label_path, 'r', encoding='utf8', errors='ignore') as rf:
                        lines = [ln.strip() for ln in rf.readlines() if ln.strip()]
                except Exception:
                    lines = []

                out_lines = []
                # Determine if this label file is inside a class folder (used to detect per-class files)
                cand_lower = found_label_path.lower()
                is_in_class_folder = cls.lower().replace(" ", "") in cand_lower or cls.lower() in cand_lower

                for ln in lines:
                    parts = ln.split()
                    if len(parts) == 5 and parts[0].lstrip('-').isdigit():
                        # class_id + normalized coords
                        src_cid = parts[0]
                        # remap only when it looks like per-class (common: src_cid == '0' in per-class)
                        if src_cid == '0' and is_in_class_folder:
                            parts[0] = str(class_id)
                        # if src_cid is out of range, replace it
                        else:
                            try:
                                nci = int(src_cid)
                                if nci < 0 or nci >= len(CLASSES):
                                    parts[0] = str(class_id)
                            except Exception:
                                parts[0] = str(class_id)
                        out_lines.append(' '.join(parts))
                    elif len(parts) == 4:
                        # coords-only normalized -> assume belongs to current class
                        out_lines.append(' '.join([str(class_id)] + parts))
                    else:
                        # ignore malformed lines
                        continue

                with open(label_dst_path, 'w', encoding='utf8') as wf:
                    if out_lines:
                        wf.write('\n'.join(out_lines) + '\n')
                        copied_labels += 1
                    else:
                        # write placeholder if file empty after parsing
                        wf.write('')
                        placeholders += 1
                continue  # proceed to next image

            # if not found any label file -> create empty placeholder
            open(label_dst_path, 'w').close()
            placeholders += 1
            # store example for debugging (up to a few)
            if len(not_found_examples) < 10:
                not_found_examples.append(os.path.join(img_src, img))

# -------- data.yaml --------
yolo_path = YOLO_DIR.replace("\\", "/")
with open(os.path.join(YOLO_DIR, 'data.yaml'), 'w', encoding='utf8') as f:
    f.write(f"""train: {yolo_path}/images/train
val: {yolo_path}/images/val
test: {yolo_path}/images/test

nc: {len(CLASSES)}
names: {CLASSES}
""")

# -------- SUMMARY --------
print("DONE")
print("Images copied:", copied_images)
print("Labels with coords copied:", copied_labels)
print("Placeholders created (no coords):", placeholders)
if not_found_examples:
    print("Examples of images without found label files (first 10):")
    for p in not_found_examples:
        print(" -", p)