import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import sys
import json

input_data = json.loads(sys.stdin.read())

data = input_data["data"]
months = input_data["months"]

df = pd.DataFrame(data)

df["month_index"] = range(len(df))

X = df[["month_index"]]
y = df["revenue"]

model = LinearRegression()
model.fit(X,y)

future = []

for i in range(months):
    future.append([len(df)+i])

future = np.array(future)

pred = model.predict(future)

print(json.dumps(pred.tolist()))