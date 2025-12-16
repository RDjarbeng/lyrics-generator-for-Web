import os
from video_generator import generate_lyric_video

def test_generation():
    print("Testing standard video generation...")
    lines = ["Line 1", "Line 2", "Line 3"]
    settings = {
        'resolution': (640, 480),
        'duration_per_line': 1,
        'font_size': 40,
        'transparent': False
    }
    output = "test_standard.mp4"
    if os.path.exists(output):
        os.remove(output)
        
    generate_lyric_video(lines, output, settings)
    
    if os.path.exists(output):
        print(f"Standard video generated successfully: {output}")
    else:
        print("Failed to generate standard video")

    print("\nTesting transparent video generation...")
    settings['transparent'] = True
    output_trans = "test_transparent.mov"
    if os.path.exists(output_trans):
        os.remove(output_trans)
        
    generate_lyric_video(lines, output_trans, settings)
    
    if os.path.exists(output_trans):
        print(f"Transparent video generated successfully: {output_trans}")
    else:
        print("Failed to generate transparent video")

if __name__ == "__main__":
    test_generation()
