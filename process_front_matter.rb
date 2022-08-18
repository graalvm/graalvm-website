#!/usr/bin/env ruby

require 'yaml'

add_title = false
version_permalinks = false
add_redirects = false
folders = []

ARGV.each do |arg|
  case arg
  when '--add-title'
    add_title = true
  when '--version-permalinks'
    version_permalinks = true
  when '--add-redirects'
    add_redirects = true
  when /^-/
    raise "Unknown option: #{arg}"
  else
    folders << arg
  end
end

folders.each do |folder|
  Dir.glob("#{folder}/**/*.md") do |file|
    puts file if $VERBOSE

    lines = File.readlines(file)
    lines = lines.drop(1)
    last_yaml_line = lines.index { |line|
      line.strip == "---"
    }

    unless last_yaml_line
      warn "No YAML header in #{file} !"
      next
    end

    yaml = lines[0...last_yaml_line].join
    body = lines[last_yaml_line+1..-1].join
    begin
      header = YAML.load yaml
    rescue Psych::SyntaxError => e
      warn "Could not parse the YAML header in #{file}:\n#{e.inspect}"
      next
    end

    next if %w[redirected docs_landing].include? header["layout"]

    if add_title
      # Add title:
      unless header.include?('title')
        title = body[/^##?\s+(\S.+)$/, 1]
        if title
          header['title'] = title
        elsif title = header['link_title']
          warn "No h1/h2 in #{file}, using link_title instead"
          header['title'] = title
        else
          warn "Could not find title in #{file}"
        end
      end
    end

    if version_permalinks
      # Add version in permalink:
      # Updates
      # permalink: /foo => permalink: "/$version/foo"
      # Does not change:
      # permalink: "/$version/foo"
      if permalink = header['permalink']
        permalink = permalink[1...-1] if permalink.start_with?('"')
        versioned_permalink = if permalink.start_with?('/$version')
          permalink
        else
          "/$version#{permalink}"
        end
        header['permalink'] = versioned_permalink
      end
    end

    # Add redirect_from: for unversioned URLs
    if add_redirects and permalink
      redirects = Array(header['redirect_from'])
      redirect_to_latest_release = permalink.sub('/$version', '')
      redirects << redirect_to_latest_release unless redirects.include?(redirect_to_latest_release)
      header['redirect_from'] = redirects
    end

    contents = "#{YAML.dump(header).chomp}\n---\n#{body}"
    File.write(file, contents)
  end
end
