# Get the directory that this configuration file exists in
dir = File.dirname(__FILE__)

# Load the sencha-touch framework automatically.
load File.join(dir, '..', '..', '..', 'touch', 'resources', 'themes')
load File.join(dir, '..', 'themes')

# Compass configurations
sass_path = dir
css_path = File.join(dir, "..", "css")

# Require any additional compass plugins here.
images_dir = File.join(dir, "..", "images")
output_style = :compressed
module Sass::Script::Functions
  def chart_image(path, mime_type = nil)
    path = path.value
    images_path = File.join(File.dirname(__FILE__), "..", "images", path)
    inline_image_string(data(images_path), compute_mime_type(path, mime_type))
  end
end

environment = :production
