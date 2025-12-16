import customtkinter as ctk
import threading
from tkinter import filedialog, messagebox
import os
from video_generator import generate_lyric_video

ctk.set_appearance_mode("System")
ctk.set_default_color_theme("blue")

class LyricsVideoApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Lyrics Video Generator")
        self.geometry("800x600")

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Main Layout
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        self.main_frame.grid_columnconfigure(1, weight=1)
        self.main_frame.grid_rowconfigure(1, weight=1)

        # Title
        self.label_title = ctk.CTkLabel(self.main_frame, text="Lyrics Video Generator", font=("Roboto", 24))
        self.label_title.grid(row=0, column=0, columnspan=2, pady=(10, 20))

        # Left Side - Settings
        self.settings_frame = ctk.CTkFrame(self.main_frame)
        self.settings_frame.grid(row=1, column=0, padx=(0, 10), sticky="ns")

        self.label_duration = ctk.CTkLabel(self.settings_frame, text="Duration per line (s):")
        self.label_duration.pack(pady=(10, 0), padx=10, anchor="w")
        self.entry_duration = ctk.CTkEntry(self.settings_frame)
        self.entry_duration.insert(0, "3.0")
        self.entry_duration.pack(pady=(0, 10), padx=10, fill="x")

        self.label_fontsize = ctk.CTkLabel(self.settings_frame, text="Font Size:")
        self.label_fontsize.pack(pady=(10, 0), padx=10, anchor="w")
        self.entry_fontsize = ctk.CTkEntry(self.settings_frame)
        self.entry_fontsize.insert(0, "70")
        self.entry_fontsize.pack(pady=(0, 10), padx=10, fill="x")

        self.check_transparent = ctk.CTkCheckBox(self.settings_frame, text="Transparent Background")
        self.check_transparent.pack(pady=20, padx=10, anchor="w")

        # Right Side - Text Input
        self.text_frame = ctk.CTkFrame(self.main_frame)
        self.text_frame.grid(row=1, column=1, sticky="nsew")
        self.text_frame.grid_columnconfigure(0, weight=1)
        self.text_frame.grid_rowconfigure(1, weight=1)

        self.label_text = ctk.CTkLabel(self.text_frame, text="Enter Lyrics/Text:")
        self.label_text.grid(row=0, column=0, pady=(10, 0), padx=10, sticky="w")
        
        self.textbox = ctk.CTkTextbox(self.text_frame)
        self.textbox.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="nsew")

        # Bottom - Action
        self.button_generate = ctk.CTkButton(self.main_frame, text="Generate Video", command=self.start_generation)
        self.button_generate.grid(row=2, column=0, columnspan=2, pady=20)

        self.status_label = ctk.CTkLabel(self.main_frame, text="")
        self.status_label.grid(row=3, column=0, columnspan=2, pady=(0, 10))

    def start_generation(self):
        text = self.textbox.get("1.0", "end-1c")
        if not text.strip():
            messagebox.showwarning("Input Error", "Please enter some text.")
            return

        try:
            duration = float(self.entry_duration.get())
            font_size = int(self.entry_fontsize.get())
        except ValueError:
            messagebox.showerror("Input Error", "Invalid number format for duration or font size.")
            return

        is_transparent = self.check_transparent.get() == 1

        # Ask for save location
        file_types = [("Video File", "*.mp4")]
        if is_transparent:
            file_types = [("QuickTime Video", "*.mov"), ("WebM Video", "*.webm")]
        
        output_file = filedialog.asksaveasfilename(defaultextension=".mp4" if not is_transparent else ".mov",
                                                   filetypes=file_types)
        
        if not output_file:
            return

        settings = {
            'duration_per_line': duration,
            'font_size': font_size,
            'transparent': is_transparent,
            'resolution': (1920, 1080),
            'text_color': 'white'
        }

        self.button_generate.configure(state="disabled", text="Generating...")
        self.status_label.configure(text="Generating video... Please wait.")

        # Run in a separate thread
        thread = threading.Thread(target=self.run_generation, args=(text, output_file, settings))
        thread.start()

    def run_generation(self, text, output_file, settings):
        try:
            lines = text.split('\n')
            # Filter empty lines if desired, or keep them for timing
            # lines = [l for l in lines if l.strip()] 
            
            generate_lyric_video(lines, output_file, settings)
            
            self.after(0, lambda: self.generation_complete(True, output_file))
        except Exception as e:
            self.after(0, lambda: self.generation_complete(False, str(e)))

    def generation_complete(self, success, message):
        self.button_generate.configure(state="normal", text="Generate Video")
        if success:
            self.status_label.configure(text=f"Done! Saved to {message}")
            messagebox.showinfo("Success", f"Video generated successfully!\nSaved to: {message}")
        else:
            self.status_label.configure(text="Error occurred.")
            messagebox.showerror("Error", f"An error occurred:\n{message}")

if __name__ == "__main__":
    app = LyricsVideoApp()
    app.mainloop()
