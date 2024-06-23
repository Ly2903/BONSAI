# -*- coding: utf-8 -*-
import json
import os
import joblib
from sklearn.neighbors import NearestNeighbors
import sys
import nltk
from nltk.tokenize import word_tokenize
import pandas as pd
import numpy as np
from itertools import combinations
import pandas as pd
import numpy as np
from itertools import combinations


def prepare_training_data():
    df = pd.read_excel(excel_file_path)
    keyword_dictionary = {}
    all_keywords = []

    # Tạo all_keywords từ dữ liệu
    for index, row in df.iterrows():
        plant_type = row['Key']
        good_attributes = row['LabelGood'].split(', ')
        bad_attributes = row['LabelBad'].split(', ')
        for attr in good_attributes + bad_attributes:
            if attr not in all_keywords:
                all_keywords.append(attr)
                keyword_dictionary[plant_type] = good_attributes + \
                    bad_attributes

    # Lưu dữ liệu dưới dạng JSON
    with open(file_path_all_keywords, 'w', encoding='utf-8') as file:
        json.dump(all_keywords, file, ensure_ascii=False)

    with open(file_path_keyword_dict, 'w', encoding='utf-8') as file:
        json.dump(keyword_dictionary, file, ensure_ascii=False)

    # Tạo vector cho mỗi loại cây và nhãn tương ứng
    all_vectors = []

    # Tạo vector cho mỗi loại cây và nhãn tương ứng
    for index, row in df.iterrows():
        good_attributes = row['LabelGood'].split(', ')
        bad_attributes = row['LabelBad'].split(', ')
        # Tạo các vector
        good_vectors = []
        bad_vectors = []
        for r in range(1, len(all_keywords) + 1):
            # Tổ hợp các từ khóa
            good_combinations = list(combinations(good_attributes, r))
            bad_combinations = list(combinations(bad_attributes, r))

           # Tạo vector
            for combination in good_combinations:
                good_vector = np.zeros(len(all_keywords))
                for attr in combination:
                    good_vector[all_keywords.index(attr)] = 1
                good_vectors.append(good_vector)

            for combination in bad_combinations:
                bad_vector = np.zeros(len(all_keywords))
                for attr in combination:
                    bad_vector[all_keywords.index(attr)] = 1
                bad_vectors.append(bad_vector)

        # Gắn nhãn cho vector
        good_label = f"{row['Key']}_NhanTot"
        bad_label = f"{row['Key']}_NhanKem"

        all_vectors.extend([(good_label, *vector) for vector in good_vectors])
        all_vectors.extend([(bad_label, *vector) for vector in bad_vectors])

    # Lưu kết quả vào Excel
    result_df = pd.DataFrame(all_vectors, columns=['Label', *all_keywords])
    result_df.to_excel(file_path_vectors_keywords, index=False)

    return keyword_dictionary, all_keywords

# Dữ liệu
# data = {
#     'Key': ['Cây tắc kiểng', 'Cây xương rồng', 'Cây sen đá'],
#     'LabelGood': ["tưới đều đặn, tránh ngập nước, đất khô, haha",
#                   "tưới nước ít, nắng trực tiếp, nhiều cát",
#                   "khỏe mạnh, tăng trưởng nhanh, chịu hạn"],
#     'LabelBad': ["không gian nhỏ, lá quăn queo, lá xoăn",
#                  "đóm nâu, chấm mốc, cây khô",
#                  "dễ úng, bị nấm, sốc nhiệt"]
# }

# df = pd.DataFrame(data)

# # Tạo tập từ điển từ các thuộc tính
# attribute_list = ["tưới đều đặn", "tránh ngập nước", "đất khô", "haha", "tưới nước ít", "nắng trực tiếp", "nhiều cát",
#                   "khỏe mạnh", "tăng trưởng nhanh", "chịu hạn", "không gian nhỏ", "lá quăn queo", "lá xoăn",
#                   "đóm nâu", "chấm mốc", "cây khô",
#                   "dễ úng", "bị nấm", "sốc nhiệt"]

# # Tạo vector cho mỗi loại cây và nhãn tương ứng
# all_vectors = []

# # Tạo vector cho mỗi loại cây và nhãn tương ứng
# for index, row in df.iterrows():
#     good_attributes = row['LabelGood'].split(', ')
#     bad_attributes = row['LabelBad'].split(', ')

#     # Tạo các vector
#     good_vectors = []
#     bad_vectors = []

#     for r in range(1, len(attribute_list) + 1):
#         # Tổ hợp các từ khóa
#         good_combinations = list(combinations(good_attributes, r))
#         bad_combinations = list(combinations(bad_attributes, r))

#         # Tạo vector
#         for combination in good_combinations:
#             good_vector = np.zeros(len(attribute_list))
#             for attr in combination:
#                 good_vector[attribute_list.index(attr)] = 1
#             good_vectors.append(good_vector)

#         for combination in bad_combinations:
#             bad_vector = np.zeros(len(attribute_list))
#             for attr in combination:
#                 bad_vector[attribute_list.index(attr)] = 1
#             bad_vectors.append(bad_vector)

#     # Gắn nhãn cho vector
#     good_label = f"{row['Key']}_NhanTot"
#     bad_label = f"{row['Key']}_NhanKem"

#     # In vector và nhãn tương ứng
#     for i, vector in enumerate(good_vectors):
#         print(f"{good_label}_{i + 1}: {vector}")
#     for i, vector in enumerate(bad_vectors):
#         print(f"{bad_label}_{i + 1}: {vector}")

#     all_vectors.extend([(good_label, *vector) for vector in good_vectors])
#     all_vectors.extend([(bad_label, *vector) for vector in bad_vectors])

# # Lưu kết quả vào Excel
# result_df = pd.DataFrame(all_vectors, columns=['Label', *attribute_list])
# result_df.to_excel(
#     'D:/TNDH/souce-code/server/src/assets/output_vectors.xlsx', index=False)


# excel_file_path = './src/assets/Data.xlsx'
model_file_path = 'D:/TNDH/souce-code/server/src/assets/trained_model.joblib'
excel_file_path = 'D:/TNDH/souce-code/server/src/assets/Data.xlsx'


# Nhận dữ liệu từ Node.js
# keySearch = sys.argv[1]

# Tải tài liệu và từ điển tiếng Việt
# nltk.download('punkt')

# Đọc dữ liêu từ file excel

def prepare_training_data(excel_file_path):
    df = pd.read_excel(excel_file_path)

    keyword_dictionary = {}
    all_keywords = []

    # Tạo attribute_list từ dữ liệu
    for index, row in df.iterrows():
        plant_type = row['Key']
        good_attributes = row['LabelGood'].split(', ')
        bad_attributes = row['LabelBad'].split(', ')
        for attr in good_attributes + bad_attributes:
            if attr not in all_keywords:
                all_keywords.append(attr)
                keyword_dictionary[plant_type] = good_attributes + \
                    bad_attributes

    # Lưu dữ liệu dưới dạng JSON
    with open('D:/TNDH/souce-code/server/src/assets/all_keywords.json', 'w', encoding='utf-8') as file:
        json.dump(all_keywords, file, ensure_ascii=False)

    with open('D:/TNDH/souce-code/server/src/assets/labels.json', 'w', encoding='utf-8') as file:
        json.dump(list(keyword_dictionary.keys()), file, ensure_ascii=False)

    return keyword_dictionary, all_keywords

# def prepare_training_data(excel_file_path):
#     df = pd.read_excel(excel_file_path)

#     keyword_dictionary = {}
#     all_keywords = []

#     for index, row in df.iterrows():
#         plant_type = row['Key']
#         list_keywords = row['Value'].split(', ')

#         # Thêm từ khóa vào danh sách duy nhất
#         for keyword in list_keywords:
#             if keyword not in all_keywords:
#                 all_keywords.append(keyword)

#         keyword_dictionary[plant_type] = list_keywords

#     # Lưu dữ liệu dưới dạng JSON
#     # with open('./src/assets/all_keywords.json', 'w', encoding='utf-8') as file:
#     #     json.dump(all_keywords, file, ensure_ascii=False)

#     # with open('./src/assets/labels.json', 'w', encoding='utf-8') as file:
#     #     json.dump(list(keyword_dictionary.keys()), file, ensure_ascii=False)

#     return keyword_dictionary, all_keywords

# Function to train the KNN model


def train_knn_model(vectors):
    knn_model = NearestNeighbors(n_neighbors=1, metric='euclidean')
    knn_model.fit(vectors)
    return knn_model

# Function to find similar plants


def find_similar_plant(keySearch, knn_model, all_keywords, labels):
    keySearch = word_tokenize(keySearch)
    user_vector = np.zeros(len(all_keywords))

    for i, keyword in enumerate(all_keywords):
        keyword_tokens = word_tokenize(keyword)
        user_vector[i] = sum(
            1 for token in keySearch if token in keyword_tokens)

    _, indices = knn_model.kneighbors([user_vector])
    similar_plants = [labels[i] for i in indices[0]]
    return similar_plants

# Thêm hàm để huấn luyện và lưu trữ mô hình


def train_and_save_model():
    keyword_dictionary, all_keywords = prepare_training_data(excel_file_path)

    vectors = []
    labels = []

    for label, keywords in keyword_dictionary.items():
        vector = np.zeros(len(all_keywords))
        for i, keyword in enumerate(all_keywords):
            vector[i] = 1 if keyword in keywords else 0
        vectors.append(vector)
        labels.append(label)

    vectors = np.array(vectors)
    labels = np.array(labels)

    knn_model = train_knn_model(vectors)
    # Lưu trữ mô hình vào một tệp
    joblib.dump(
        knn_model, 'D:/TNDH/souce-code/server/src/assets/trained_model.joblib')


def load_all_keywords_labels():
    try:
        file_path_all_keywords = 'D:/TNDH/souce-code/server/src/assets/all_keywords.json'
        file_path_labels = 'D:/TNDH/souce-code/server/src/assets/labels.json'

        # Load data from JSON file
        with open(file_path_all_keywords, 'r', encoding='utf-8') as json_file:
            all_keywords = json.load(json_file)

        with open(file_path_labels, 'r', encoding='utf-8') as json_file:
            labels = json.load(json_file)
        return all_keywords, labels

    except FileNotFoundError:
        print("FileNotFoundError")
        return None, None


if __name__ == "__main__":
    # Kiểm tra sự tồn tại của file mô hình và xem liệu có sự kiện thay đổi trong file Excel hay không
    # if not os.path.exists(model_file_path) or (len(sys.argv) and sys.argv[1] == 'update'):
    train_and_save_model()

    # if os.path.exists(model_file_path) and len(sys.argv) > 1:
    if os.path.exists(model_file_path):
        # Load all_keywords and labels from the file
        all_keywords, labels = load_all_keywords_labels()
        # keySearch = sys.argv[1]
        keySearch = "khô"
        # Load mô hình từ tệp
        knn_model = joblib.load(model_file_path)

        similar_plants = find_similar_plant(
            keySearch, knn_model, all_keywords, labels)
        for plant in similar_plants:
            sys.stderr.write(plant + ',')

# def prepare_training_data(excel_file_path):
#     df = pd.read_excel(excel_file_path)
#     # Xây dựng tập từ điển các từ khóa cho mỗi loại cây lấy từ file excel
#     keyword_dictionary = {}
#     for index, row in df.iterrows():
#         plant_type = row['Key']
#         list_keywords = row['Value'].split(', ')
#         keyword_dictionary[plant_type] = list_keywords
#     # Tạo danh sách các từ khóa duy nhất
#     all_keywords = list(
#         set(keyword for keywords in keyword_dictionary.values() for keyword in keywords))

#     # Tạo tập vector huấn luyện cho từng loại cây dựa trên từ khóa người dùng
#     vectors = []
#     labels = []
#     for label, keywords in keyword_dictionary.items():
#         vector = np.zeros(len(all_keywords))
#         for i, keyword in enumerate(all_keywords):
#             vector[i] = 1 if keyword in keywords else 0
#         vectors.append(vector)
#         labels.append(label)
#     vectors = np.array(vectors)
#     labels = np.array(labels)

#     return vectors, labels, all_keywords

# # Khởi tạo và huấn luyện mô hình KNN


# def train_knn_model(vectors):
#     # Khởi tạo và huấn luyện mô hình KNN
#     knn_model = NearestNeighbors(n_neighbors=3, metric='euclidean')
#     knn_model.fit(vectors)
#     return knn_model


# def find_similar_plant(keySearch, knn_model, all_keywords, labels):
#     # 'keySearch' là từ khóa đầu vào - dùng word_tokenize để tách từ khóa đầu vào
#     keySearch = word_tokenize(keySearch)
#     user_vector = np.zeros(len(all_keywords))
#     for i, keyword in enumerate(all_keywords):
#         keyword_tokens = word_tokenize(keyword)
#         for token in keySearch:
#             user_vector[i] += 1 if token in keyword_tokens else 0

#     # Sử dụng mô hình KNN để tìm ra k loại cây gần nhất dựa trên vector đặc trưng của từ khóa người dùng
#     distances, indices = knn_model.kneighbors([user_vector])

#     # Các loại cây phù hợp với từ khóa người dùng cung cấp
#     similar_plants = [labels[i] for i in indices[0]]

#     # for i in indices[0]:
#     # sys.stderr.write(labels[i] + ',')
#     return similar_plants


# if __name__ == "__main__":
#     excel_file_path = './src/assets/Data.xlsx'

#     # Prepare training data
#     vectors, labels, all_keywords = prepare_training_data(excel_file_path)

#     # Train the KNN model
#     knn_model = train_knn_model(vectors)

#     # Find similar plants
#     similar_plants = find_similar_plant(
#         keySearch, knn_model, all_keywords, labels)

#     # Output the result or further processing
#     for plant in similar_plants:
#         sys.stderr.write(plant + ',')
#  -------------------------------------

# Lưu code cũ
# -*- coding: utf-8 -*-
# from nltk.tokenize import word_tokenize
# import nltk
# import sys
# from sklearn.neighbors import NearestNeighbors
# import numpy as np
# import pandas as pd


# # Nhận dữ liệu từ Node.js
# keySearch = sys.argv[1]


# # Tải tài liệu và từ điển tiếng Việt
# # nltk.download('punkt')

# # Đọc dữ liêu từ file excel
# excel_file_path = './src/assets/Data.xlsx'
# df = pd.read_excel(excel_file_path)

# # Xây dựng tập từ điển các từ khóa cho mỗi loại cây lấy từ file excel
# keyword_dictionary = {}
# for index, row in df.iterrows():
#     plant_type = row['Key']
#     list_keywords = row['Value'].split(', ')
#     keyword_dictionary[plant_type] = list_keywords

# # Tạo danh sách các từ khóa duy nhất
# all_keywords = list(
#     set(keyword for keywords in keyword_dictionary.values() for keyword in keywords))


# # Tạo tập vector huấn luyện cho từng loại cây dựa trên từ khóa người dùng
# vectors = []
# labels = []
# for label, keywords in keyword_dictionary.items():
#     vector = np.zeros(len(all_keywords))
#     for i, keyword in enumerate(all_keywords):
#         vector[i] = 1 if keyword in keywords else 0
#     vectors.append(vector)
#     labels.append(label)
# vectors = np.array(vectors)
# labels = np.array(labels)

# # Khởi tạo và huấn luyện mô hình KNN
# knn_model = NearestNeighbors(n_neighbors=3, metric='euclidean')
# knn_model.fit(vectors)

# # 'thân leo' là từ khóa đầu vào - dùng word_tokenize để tách từ khóa đầu vào
# keySearch = word_tokenize(keySearch)
# user_vector = np.zeros(len(all_keywords))
# for i, keyword in enumerate(all_keywords):
#     keyword_tokens = word_tokenize(keyword)
#     for token in keySearch:
#         user_vector[i] += 1 if token in keyword_tokens else 0

# # Sử dụng mô hình KNN để tìm ra k loại cây gần nhất dựa trên vector đặc trưng của từ khóa người dùng
# distances, indices = knn_model.kneighbors([user_vector])

# # Các loại câ phù hợp với từ khóa người dùng cung cấp
# for i in indices[0]:
#     sys.stderr.write(labels[i] + ',')


# Labels/Keywords           tưới đều đặn     tránh ngập nước    đất khô   ánh sáng yếu     tăng trưởng chậm   lá xoăn   chậm tăng trưởng
# Tắc tốt                         1                   1               1           0               0               0               0
# Tắc xấu                         0                   0               0           1               1               0               0
# Tắc tốt                         1                   0               1           1               1               0               0
# Tắc xấu                         0                   1               1           1               0               0               0


# *************************************************************************************
# -*- coding: utf-8 -*-
# import json
# import os
# import joblib
# from sklearn.neighbors import NearestNeighbors
# import sys
# import nltk
# from nltk.tokenize import word_tokenize
# import pandas as pd
# import numpy as np
# from itertools import combinations
# import pandas as pd
# import numpy as np
# from itertools import combinations

# model_file_path = 'D:/TNDH/souce-code/server/src/assets/trained_model.joblib'
# excel_file_path = 'D:/TNDH/souce-code/server/src/assets/Data.xlsx'

# def prepare_training_data(excel_file_path):
#     df = pd.read_excel(excel_file_path)

#     keyword_dictionary = {}
#     all_keywords = []

#     for index, row in df.iterrows():
#         plant_type = row['Key']
#         good_attributes = row['LabelGood'].split(', ')
#         bad_attributes = row['LabelBad'].split(', ')
#         for attr in good_attributes + bad_attributes:
#             if attr not in all_keywords:
#                 all_keywords.append(attr)
#         keyword_dictionary[plant_type] = good_attributes + bad_attributes

#     with open('D:/TNDH/souce-code/server/src/assets/all_keywords.json', 'w', encoding='utf-8') as file:
#         json.dump(all_keywords, file, ensure_ascii=False)

#     with open('D:/TNDH/souce-code/server/src/assets/labels.json', 'w', encoding='utf-8') as file:
#         json.dump(list(keyword_dictionary.keys()), file, ensure_ascii=False)

#     return keyword_dictionary, all_keywords


# def train_knn_model(vectors):
#     knn_model = NearestNeighbors(n_neighbors=3, metric='euclidean')
#     knn_model.fit(vectors)
#     return knn_model

# def find_similar_plant(keySearch, knn_model, all_keywords, labels):
#     keySearch = word_tokenize(keySearch)
#     user_vector = np.zeros(len(all_keywords))

#     for i, keyword in enumerate(all_keywords):
#         keyword_tokens = word_tokenize(keyword)
#         user_vector[i] = sum(
#             1 for token in keySearch if token in keyword_tokens)

#     _, indices = knn_model.kneighbors([user_vector])
#     similar_plants = [labels[i] for i in indices[0]]
#     return similar_plants

# def train_and_save_model():
#     keyword_dictionary, all_keywords = prepare_training_data(excel_file_path)

#     vectors = []
#     labels = []

#     for label, keywords in keyword_dictionary.items():
#         vector = np.zeros(len(all_keywords))
#         for i, keyword in enumerate(all_keywords):
#             vector[i] = 1 if keyword in keywords else 0
#         vectors.append(vector)
#         labels.append(label)

#     vectors = np.array(vectors)
#     labels = np.array(labels)

#     knn_model = train_knn_model(vectors)

# def load_all_keywords_labels():
#     try:
#         file_path_all_keywords = 'D:/TNDH/souce-code/server/src/assets/all_keywords.json'
#         file_path_labels = 'D:/TNDH/souce-code/server/src/assets/labels.json'

#         with open(file_path_all_keywords, 'r', encoding='utf-8') as json_file:
#             all_keywords = json.load(json_file)

#         with open(file_path_labels, 'r', encoding='utf-8') as json_file:
#             labels = json.load(json_file)
#         return all_keywords, labels

#     except FileNotFoundError:
#         print("FileNotFoundError")
#         return None, None


# if __name__ == "__main__":
#     train_and_save_model()

#     if os.path.exists(model_file_path):
#         all_keywords, labels = load_all_keywords_labels()
#         keySearch = "khô"
#         knn_model = joblib.load(model_file_path)

#         similar_plants = find_similar_plant(
#             keySearch, knn_model, all_keywords, labels)
#         for plant in similar_plants:
#             sys.stderr.write(plant + ',')

def chunk_feature(str, arrPolarityTerm):
    # Maximum_Matching
    vTerm = []
    strRemain = ""
    start = 0
    isTerm = False
    isStop = False

    str = str.lower()
    str = str.lstrip(" ").rstrip(" ")
    WordList = str.split(" ")
    stop = len(WordList)

    while (isStop == False and stop >= 0):
        for num in range(start, stop):
            strRemain = strRemain + WordList[num] + " "

        strRemain = strRemain.lstrip(" ").rstrip(" ").lower()
        isTerm = False
        for cha in range(0, len(arrPolarityTerm)):
            arr = arrPolarityTerm[cha]
            if (arr == strRemain):
                vTerm.append(strRemain)
                isTerm = True
                if (start == 0):
                    isStop = True
                else:
                    stop = start
                    start = 0

        if (isTerm == False):
            if (start == stop):
                stop = stop - 1
                start = 0
            else:
                start += 1

        strRemain = ""
    strRemain = ""
    for stt in range(0, len(vTerm)):
        strRemain = strRemain + " " + vTerm[stt]

    return vTerm


arrTerm = ['hôm nay', 'hôm', 'nay', 'thi tốt', 'thi tốt nghiệp', 'tốt nghiệp']
strtemp = 'hôm nay thi tốt nghiệp'
arr = chunk_feature(strtemp, arrTerm)

print(arr)


def train_and_save_model(keyword_dictionary, all_keywords):
    vectors = []
    labels = []

    for label, keywords in keyword_dictionary.items():
        vector = np.zeros(len(all_keywords))
        for i, keyword in enumerate(all_keywords):
            vector[i] = 1 if keyword in keywords else 0
        vectors.append(vector)
        labels.append(label)

    vectors = np.array(vectors)
    labels = np.array(labels)

    knn_model = train_knn_model(vectors)
    # Lưu trữ mô hình vào một tệp
    joblib.dump(
        knn_model, 'D:/TNDH/souce-code/server/src/assets/trained_model.joblib')
