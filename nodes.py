class PromptSE:
    """
    A simple node for creating, editing, and combining custom prompt entries.
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "optional": {},
            "hidden": {
                "promptse_data": ("STRING", {"multiline": True, "default": "{}"}),
            },
        }
    
    CATEGORY = "PromptSE"
    FUNCTION = "process"
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("output_string",)
    
    def __init__(self):
        # Default data structure
        self.default_data = {
            "entries": [
                {"id": "entry1", "title": "Character", "content": "beautiful girl, long hair", "enabled": True, "weight": 1.0},
                {"id": "entry2", "title": "Style", "content": "anime style, high quality", "enabled": True, "weight": 1.2},
                {"id": "entry3", "title": "Details", "content": "detailed, masterpiece", "enabled": False, "weight": 1.0}
            ],
            "settings": {
                "connector": ", ",
                "mode": "M",
                "weightFormat": "parentheses"
            },
            "lexicon": []
        }
    
    def process(self, promptse_data="{}", **kwargs):
        """
        Process the prompt data and return the combined string.
        """
        import json
        
        print(f"PromptSE: Received raw data: '{promptse_data}'")
        
        # Parse the data from the widget
        try:
            if isinstance(promptse_data, str) and promptse_data.strip():
                data = json.loads(promptse_data)
                print(f"PromptSE: Parsed data successfully: {data}")
            else:
                data = self.default_data
                print(f"PromptSE: Using default data: {data}")
        except (json.JSONDecodeError, Exception) as e:
            print(f"PromptSE: Error parsing data: {e}, using default")
            data = self.default_data
        
        mode = data.get("settings", {}).get("mode", "M")
        connector = data.get("settings", {}).get("connector", ", ")
        weight_format = data.get("settings", {}).get("weightFormat", "parentheses")
        entries = data.get("entries", [])
        
        print(f"PromptSE: Processing - Mode: {mode}, Connector: '{connector}', Weight Format: {weight_format}, Entries: {len(entries)}")
        
        def format_content_with_weight(content, weight):
            """Format content with weight according to the specified format"""
            if weight_format == "none" or weight == 1.0:
                return content
            elif weight_format == "parentheses":
                return f"({content}:{weight:.1f})"
            elif weight_format == "brackets":
                return f"[{content}:{weight:.1f}]"
            else:
                return content
        
        final_parts = []
        
        if mode == "S":
            # Single mode: find the first enabled entry
            for entry in entries:
                if entry.get("enabled", False):
                    content = entry.get("content", "").strip()
                    weight = entry.get("weight", 1.0)
                    if content:
                        formatted_content = format_content_with_weight(content, weight)
                        final_parts.append(formatted_content)
                        print(f"PromptSE: Single mode - selected: '{formatted_content}' (weight: {weight})")
                    break
        else:
            # Multiple mode: concatenate all enabled entries
            for entry in entries:
                if entry.get("enabled", False):
                    content = entry.get("content", "").strip()
                    weight = entry.get("weight", 1.0)
                    if content:
                        formatted_content = format_content_with_weight(content, weight)
                        final_parts.append(formatted_content)
                        print(f"PromptSE: Multiple mode - added: '{formatted_content}' (weight: {weight})")
        
        output_string = connector.join(final_parts)
        print(f"PromptSE: Generated output: '{output_string}'")
        return (output_string,)

# Test the node
if __name__ == "__main__":
    node = PromptSE()
    print("Input types:", node.INPUT_TYPES())
    print("Test output:", node.process())