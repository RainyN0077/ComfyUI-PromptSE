from .nodes import PromptSE
import os

NODE_CLASS_MAPPINGS = {
    "PromptSE": PromptSE,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptSE": "Prompt String Editor",
}

# Tell ComfyUI where to find the web extension files
WEB_DIRECTORY = "./js"