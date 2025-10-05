source "https://rubygems.org"

# GitHub Pages gem for compatibility
gem "github-pages", group: :jekyll_plugins

# Additional gems for development
gem "webrick", "~> 1.7" # Required for Ruby 3.0+

group :jekyll_plugins do
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-feed"
end

# Windows and JRuby does not include zoneinfo files
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :mswin, :x64_mingw, :mswin]