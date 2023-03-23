require "json"
entries = JSON.load File.read("graalvm-reachability-metadata/library-and-framework-list.json")

Dir.glob('graalvm-reachability-metadata/metadata/*/*/*.json') do |metadata_index|
  next if metadata_index.include? "/samples/" # ignore samples

  metadata = JSON.load File.read(metadata_index)

  entries.push({
    "artifact" => metadata[0].fetch("module"),
    "reachability_metadata_repo" => true,
    "details" => [
      {
        "minimum_version" => metadata.collect { |x| x.fetch('metadata-version') }.min_by { |x| Gem::Version.new(x) },
        "metadata_locations" => [
          File.basename(metadata_index)
        ],
        "tests_locations" => [
          "https://github.com/oracle/graalvm-reachability-metadata/actions"
        ],
        "test_level" => "community-tested"
      }
    ]
  })
end

File.open("_includes/native-image-tested-libraries-and-frameworks.html", "w") do |file|
  file.puts <<~HEADER
  <table class="tg libs-table" style="width:100%">
  <thead>
    <tr>
      <th class="tg name" style="width:60%" title="Artifact in the groupId:artifactId format">Name</th>
      <th class="tg version" style="width:20%">Version</th>
      <th class="tg test-level" style="width:20%">Test Level</th>
    </tr>
  </thead>
  <tbody>
  HEADER

  entries.sort_by { |e| e.fetch('artifact') }.each do |entry|
    details = entry.fetch("details")
    next unless details.any? { |x| %w[fully-tested community-tested].include?(x.fetch("test_level")) }
    footnote = entry['reachability_metadata_repo'] ? '<sup><a href="#footnote-1">1)</a></sup>' : ''
    file.puts '<tr>'
    file.puts "<td class=\"tg artifact\" rowspan=\"#{details.size.to_s}\"><code title=\"#{entry["description"]}\">#{entry.fetch("artifact")}</code>#{footnote}</td>"

    details.each_with_index do |d, i|
      file.puts '<tr>' unless i == 0

      file.puts '<td class="tg">'
      file.puts "<a href=\"https://search.maven.org/artifact/#{entry.fetch("artifact").sub(':', '/')}/#{d.fetch("minimum_version")}/jar\" target=\"_blank\" title=\"Minimum version\">#{d.fetch("minimum_version")}</a> - #{d["maximum_version"] || 'latest'}"
      file.puts '</td>'

      test_level = case d.fetch("test_level")
      when "fully-tested" then "&#x2605;&#x2605;"
      when "community-tested" then "&#x2605;"
      else "&#x26AA;"
      end

      title = case d.fetch("test_level")
      when "fully-tested" then "The library or framework is continuously tested by the maintainers. This is the best test level."
      when "community-tested" then "The library or framework is continuously tested as part of the GraalVM Reachability Metadata repository or some other community-driven project."
      else "The library or framework is not tested continuously but may work in your application."
      end
      
      file.puts "<td class=\"tg test-level\"><span class=\"details\" title=\"#{title}\">#{test_level}</span></td>"

      file.puts '</tr>' unless i == 0
    end

    file.puts '</tr>'
  end
  file.puts '</tbody>'
  file.puts '</table>'
end

__END__