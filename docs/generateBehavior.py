import pandas as pd
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
from google.colab import userdata

client = genai.Client(api_key=userdata.get('GOOGLE_API_KEY'))

# Generate pet image
pet_image_prompt = f"一个像素化的{user_input_subject_chinese}，白色背景。"
pet_response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents=pet_image_prompt,
)

pet_image_parts = [
    part.inline_data.data
    for part in pet_response.candidates[0].content.parts
    if part.inline_data
]

if pet_image_parts:
    pet_image = Image.open(BytesIO(pet_image_parts[0]))
    pet_image.save('Petdefault.png')

# Generate behavior images
for behavior, description in behavior_descriptions_chinese.items():
    # Construct the Chinese prompt for behavior images
    image_prompt = f"创建一个{user_input_subject_chinese}{description}，采用像素化艺术风格"
    behavior_response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[image_prompt, pet_image], # Use pet_image as reference
    )

    behavior_image_parts = [
        part.inline_data.data
        for part in behavior_response.candidates[0].content.parts
        if part.inline_data
    ]

    if behavior_image_parts:
        behavior_image = Image.open(BytesIO(behavior_image_parts[0]))
        behavior_image.save(f'{behavior}_Behavior.png')