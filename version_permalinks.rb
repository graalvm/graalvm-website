#!/usr/bin/env ruby

require 'yaml'

folders = ["docs", "truffle/docs"]

add_redirects = false
ARGV.each do |arg|
  if arg == '--add-redirects'
    add_redirects = true
  else
    raise arg
  end
end

# Updates
# permalink: /foo => permalink: "/$version/foo"
# permalink: "/foo" => permalink: "/$version/foo"
#
# Does not change:
# permalink: "/$version/foo"

folders.each do |dir|
  Dir.glob("#{dir}/**/*.md") do |file|
    puts file if $VERBOSE

    lines = File.readlines(file)
    last_yaml_line = lines.drop(1).index { |line|
      line.strip == "---"
    }

    unless last_yaml_line
      warn "No YAML header in #{file} !"
      next
    end

    yaml = lines[0..last_yaml_line].join
    body = lines[last_yaml_line+1..-1].join
    begin
      header = YAML.load yaml
    rescue Psych::SyntaxError => e
      warn "Could not parse the YAML header in #{file}:\n#{e.inspect}"
      next
    end

    if permalink = header['permalink']
      permalink = permalink[1...-1] if permalink.start_with?('"')
      versioned_permalink = if permalink.start_with?('/$version')
        permalink
      else
        "/$version#{permalink}"
      end
      header['permalink'] = versioned_permalink
    end

    if add_redirects and permalink
      redirects = Array(header['redirect_from'])
      redirect_to_latest_release = permalink.sub('/$version', '')
      redirects << redirect_to_latest_release unless redirects.include?(redirect_to_latest_release)
      header['redirect_from'] = redirects
    end

    contents = YAML.dump(header) + body
    File.write(file, contents)
  end
end
