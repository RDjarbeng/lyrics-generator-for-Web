import os
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, concatenate_videoclips, ColorClip, CompositeVideoClip

def create_text_image(text, font_path, font_size, color, bg_color, size):
    """
    Creates an image with the given text centered.
    bg_color should be a tuple (R, G, B, A) or (R, G, B).
    If A is 0, it's transparent.
    """
    # Create a new image with transparent background
    img = Image.new('RGBA', size, bg_color)
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        font = ImageFont.load_default()
        print(f"Could not load font {font_path}, using default.")

    # Calculate text position to center it
    # getbbox returns (left, top, right, bottom)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size[0] - text_width) / 2
    y = (size[1] - text_height) / 2

    draw.text((x, y), text, font=font, fill=color)
    
    return img

def generate_lyric_video(text_lines, output_file, settings):
    """
    Generates a video from a list of text lines.
    
    settings: dict containing:
        - font_path: str
        - font_size: int
        - text_color: str or tuple
        - bg_color: str or tuple (if transparent, use (0,0,0,0))
        - resolution: tuple (width, height)
        - duration_per_line: float
        - transparent: bool
    """
    clips = []
    
    width, height = settings.get('resolution', (1920, 1080))
    duration = settings.get('duration_per_line', 3.0)
    font_path = settings.get('font_path', "arial.ttf")
    font_size = settings.get('font_size', 70)
    text_color = settings.get('text_color', 'white')
    
    is_transparent = settings.get('transparent', False)
    
    if is_transparent:
        bg_color = (0, 0, 0, 0) # Fully transparent
    else:
        bg_color = settings.get('bg_color', (0, 0, 0, 255))

    print(f"Generating video with {len(text_lines)} lines...")

    for line in text_lines:
        line = line.strip()
        if not line:
            # For empty lines, just show background
            img = Image.new('RGBA', (width, height), bg_color)
        else:
            img = create_text_image(line, font_path, font_size, text_color, bg_color, (width, height))
        
        # Convert PIL image to numpy array for MoviePy
        # MoviePy expects RGB for non-transparent or RGBA for transparent
        import numpy as np
        img_np = np.array(img)
        
        txt_clip = ImageClip(img_np).with_duration(duration)
        clips.append(txt_clip)

    final_clip = concatenate_videoclips(clips, method="compose")
    
    # Write output
    # If transparent, we need a codec that supports alpha, like prores_ks or libvpx-vp9
    if is_transparent:
        if output_file.endswith('.webm'):
            codec = 'libvpx-vp9'
            ffmpeg_params = ['-pix_fmt', 'yuva420p'] # Alpha channel support
        elif output_file.endswith('.mov'):
            codec = 'prores_ks'
            ffmpeg_params = ['-pix_fmt', 'yuva444p10le'] # High quality alpha
        else:
            # Fallback or force extension change? 
            # For now let's assume user knows or we default to mov/webm for transparency
            if not (output_file.endswith('.mov') or output_file.endswith('.webm')):
                 print("Warning: Transparency requires .mov or .webm. Appending .mov")
                 output_file += ".mov"
            codec = 'prores_ks'
            ffmpeg_params = ['-pix_fmt', 'yuva444p10le']
            
        final_clip.write_videofile(
            output_file, 
            fps=24, 
            codec=codec, 
            ffmpeg_params=ffmpeg_params,
            logger='bar'
        )
    else:
        final_clip.write_videofile(output_file, fps=24, codec='libx264')
    
    print(f"Video saved to {output_file}")
    return output_file

if __name__ == "__main__":
    # Test run
    test_lines = ["Hello world", "This is a test", "Of the lyric generator"]
    test_settings = {
        'resolution': (1280, 720),
        'duration_per_line': 2,
        'font_size': 80,
        'transparent': True
    }
    generate_lyric_video(test_lines, "test_output.mov", test_settings)
