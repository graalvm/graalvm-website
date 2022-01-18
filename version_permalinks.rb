#!/usr/bin/env ruby

folders = ["docs", "truffle/docs", "release-notes"]

# Updates
# permalink: /foo => permalink: "/$version/foo"
# permalink: "/foo" => permalink: "/$version/foo"
#
# Does not change:
# permalink: "/$version/foo" 

folders.each do |fo|    
    files = Dir.glob(File.join(fo, "**", "*.md")) 
    files.each do |f|
        text = File.read(f)
        replace = text.gsub(/(?<=permalink: )(.*)$/) do |m|
            match = Regexp.last_match[1].start_with?('"') ? Regexp.last_match[1][1..-2] : Regexp.last_match[1]
            # p match
            if match.match?(/^\/\$version/)
              "\"#{match}\""
            else
              "\"/$version#{match}\""
            end
        end
        File.open(f, "w") {|file| file.puts replace}
    end
end