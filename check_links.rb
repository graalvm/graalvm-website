# Run 'gem install anemone' to install it
require 'anemone'
require 'webrick'

server = WEBrick::HTTPServer.new({
  BindAddress: '127.0.0.1',
  Port: 4000,
  DocumentRoot: "#{__dir__}/_site",
  AccessLog: [],
})
thread = Thread.new { server.start }
begin
  site = 'http://127.0.0.1:4000/'
  success = true

  Anemone.crawl(site) do |anemone|
    anemone.on_every_page do |page|
      puts page.url if ENV['PRINT_VISITED_PAGES']
    end

    anemone.after_crawl do |pages|
      puts "\n\nResult:"
      pages.each_value do |page|
        # puts page.url
        unless page.code == 200 or page.redirect?
          abort "You need to launch the server" if page.code == nil
          success = false
          $stderr.puts
          $stderr.puts "Error #{page.code}: #{page.url}"
          $stderr.puts "Linked by: #{pages.urls_linking_to(page.url).join(', ')}"
        end
      end
    end
  end
ensure
  server.shutdown
  thread.join
end

exit success
