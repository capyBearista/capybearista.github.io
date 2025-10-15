#!/bin/bash

# 🐕 Biscuit Photo Processing Script
# This script automatically processes photos added to images/biscuit/originals/
# It creates optimized versions and updates the gallery metadata

set -e  # Exit on any error

echo "🐕 Starting Biscuit photo processing..."

# Create directories if they don't exist
mkdir -p images/biscuit/thumbnails
mkdir -p images/biscuit/full

# Initialize counters
PROCESSED_COUNT=0
NEW_PHOTOS=()

# Function to extract readable date from filename or EXIF
extract_photo_date() {
    local filepath="$1"
    local filename=$(basename "$filepath")
    
    # First try to extract EXIF date
    local exif_date=$(exiftool -d "%Y-%m-%d" -DateTimeOriginal -s3 "$filepath" 2>/dev/null)
    
    if [ -n "$exif_date" ] && [ "$exif_date" != "-" ]; then
        echo "$exif_date"
        return
    fi
    
    # Try to parse date from filename (YYYY-MM-DD or YYYY_MM_DD format)
    local date_from_name=$(echo "$filename" | grep -oE '[0-9]{4}[-_][0-9]{2}[-_][0-9]{2}' | sed 's/_/-/g' | head -1)
    
    if [ -n "$date_from_name" ]; then
        echo "$date_from_name"
        return
    fi
    
    # Fall back to file modification date
    date -r "$filepath" +"%Y-%m-%d"
}

# Function to generate caption from filename
generate_caption() {
    local filename="$1"
    local basename="${filename%.*}"
    
    # Remove "biscuit-" prefix if present
    basename=$(echo "$basename" | sed 's/^biscuit-//i')
    
    # Replace hyphens and underscores with spaces
    basename=$(echo "$basename" | sed 's/[-_]/ /g')
    
    # Capitalize first letter of each word
    echo "$basename" | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1'
}

# Function to extract commit message for this run
get_commit_message() {
    # Get the latest commit message (the one that triggered this workflow)
    local commit_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null)
    
    # Clean up commit message to use as default caption if it mentions Biscuit
    if echo "$commit_msg" | grep -iq "biscuit\|dog\|puppy\|photo"; then
        # Extract meaningful part of commit message
        echo "$commit_msg" | sed -E 's/^(Add|Added|New|Upload|Uploaded)\s*//i' | sed -E 's/\s*(photo|image|pic|picture)s?\s*//i'
    else
        echo ""
    fi
}

# Function to calculate image aspect ratio category
get_aspect_ratio_category() {
    local filepath="$1"
    
    # Get image dimensions
    local dimensions=$(identify -format "%w %h" "$filepath" 2>/dev/null)
    local width=$(echo $dimensions | cut -d' ' -f1)
    local height=$(echo $dimensions | cut -d' ' -f2)
    
    if [ -n "$width" ] && [ -n "$height" ] && [ "$height" -gt 0 ]; then
        # Calculate aspect ratio using awk for floating point math
        local aspect_ratio=$(awk "BEGIN {printf \"%.2f\", $width/$height}")
        local ratio_num=$(awk "BEGIN {print $width/$height}")
        
        # Categorize aspect ratio
        if awk "BEGIN {exit !($ratio_num > 1.5)}"; then
            echo "panorama"
        elif awk "BEGIN {exit !($ratio_num > 1.2)}"; then
            echo "landscape"
        elif awk "BEGIN {exit !($ratio_num < 0.8)}"; then
            echo "portrait"
        else
            echo "square"
        fi
    else
        echo "square"  # Default fallback
    fi
}

# Get commit message for potential use in captions
COMMIT_CAPTION=$(get_commit_message)

echo "📁 Scanning for new photos in images/biscuit/originals/..."

# Process each image file in the originals directory
for original_file in images/biscuit/originals/*.{jpg,jpeg,JPG,JPEG,png,PNG}; do
    # Skip if no files match the pattern (handles case when no files exist)
    [ ! -f "$original_file" ] && continue
    
    filename=$(basename "$original_file")
    name_no_ext="${filename%.*}"
    extension="${filename##*.}"
    
    # Convert to lowercase extension for consistency
    case "${extension,,}" in
        png)
            # Convert PNG to JPG for consistency
            output_filename="${name_no_ext}.jpg"
            ;;
        *)
            output_filename="$filename"
            ;;
    esac
    
    thumbnail_path="images/biscuit/thumbnails/$output_filename"
    full_path="images/biscuit/full/$output_filename"
    
    # Check if this photo has already been processed
    if [ -f "$thumbnail_path" ] && [ -f "$full_path" ]; then
        echo "⏭️  Skipping already processed: $filename"
        continue
    fi
    
    echo "🔄 Processing: $filename"
    
    # Extract metadata
    photo_date=$(extract_photo_date "$original_file")
    aspect_category=$(get_aspect_ratio_category "$original_file")
    
    # Generate caption
    if [ -n "$COMMIT_CAPTION" ]; then
        caption="$COMMIT_CAPTION"
    else
        caption=$(generate_caption "$filename")
    fi
    
    echo "   📅 Date: $photo_date"
    echo "   📐 Aspect: $aspect_category"
    echo "   📝 Caption: $caption"
    
    # Create thumbnail (400px width, maintain aspect ratio)
    echo "   🖼️  Creating thumbnail..."
    if command -v magick >/dev/null 2>&1; then
        magick "$original_file" \
            -auto-orient \
            -resize 400x400^ \
            -gravity center \
            -extent 400x400 \
            -quality 85 \
            -strip \
            "$thumbnail_path"
    else
        convert "$original_file" -auto-orient -resize 400x400^ -gravity center -extent 400x400 -quality 85 -strip "$thumbnail_path"
    fi
    
    # Create full-size version (1200px max width/height, maintain aspect ratio)
    echo "   🖼️  Creating full-size version..."
    if command -v magick >/dev/null 2>&1; then
        magick "$original_file" \
            -auto-orient \
            -resize 1200x1200> \
            -quality 90 \
            -strip \
            "$full_path"
    else
        convert "$original_file" -auto-orient -resize 1200x1200\> -quality 90 -strip "$full_path"
    fi
    
    # Add to array of new photos
    NEW_PHOTOS+=("$output_filename|$photo_date|$caption|$aspect_category")
    
    PROCESSED_COUNT=$((PROCESSED_COUNT + 1))
    echo "   ✅ Processed successfully"
    echo
done

# Update _data/biscuit.yml if we processed any photos
if [ ${#NEW_PHOTOS[@]} -gt 0 ]; then
    echo "📝 Updating _data/biscuit.yml with $PROCESSED_COUNT new photo(s)..."
    
    # Create backup of existing file
    if [ -f "_data/biscuit.yml" ]; then
        cp "_data/biscuit.yml" "_data/biscuit.yml.backup"
    else
        # Create initial structure if file doesn't exist
        echo "# Biscuit Photo Gallery Data" > _data/biscuit.yml
        echo "# Photos are displayed in chronological order (newest first)" >> _data/biscuit.yml
        echo "" >> _data/biscuit.yml
        echo "photos:" >> _data/biscuit.yml
    fi
    
    # Add new photos to the YAML file
    for photo_data in "${NEW_PHOTOS[@]}"; do
        IFS='|' read -r filename photo_date caption aspect_category <<< "$photo_data"
        
        echo "  - filename: \"$filename\"" >> _data/biscuit.yml
        echo "    date: \"$photo_date\"" >> _data/biscuit.yml
        echo "    caption: \"$caption\"" >> _data/biscuit.yml
        echo "    story: \"\"" >> _data/biscuit.yml
        echo "    aspect_ratio: \"$aspect_category\"" >> _data/biscuit.yml
        echo "" >> _data/biscuit.yml
        
        echo "   ✅ Added: $filename ($photo_date)"
    done
    
    echo "📊 Summary:"
    echo "   - Processed: $PROCESSED_COUNT photos"
    echo "   - Updated: _data/biscuit.yml"
    echo "   - Created: thumbnails and full-size versions"
    echo
    echo "🎉 Biscuit photo processing complete!"
    
else
    echo "ℹ️  No new photos found to process"
fi

echo "🏁 Script finished successfully!"