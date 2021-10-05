# Run 'gem install anemone' to install it
require 'anemone'

site = 'http://127.0.0.1:4000/'
success = true

Anemone.crawl(site) do |anemone|
  # anemone.on_every_page do |page|
  #   puts page.url
  #   unless page.code == 200 or page.redirect?
  #     abort "You need to launch the server" if page.code == nil
  #     success = false
  #     $stderr.puts " => Returned code #{page.code}"
  #   end
  # end

  anemone.after_crawl do |pages|
    pages.each_value do |page|
      puts page.url
      unless page.code == 200 or page.redirect?
        abort "You need to launch the server" if page.code == nil
        success = false
        $stderr.puts page.url
        $stderr.puts " => Returned code #{page.code}"
        $stderr.puts "Linked by: #{pages.urls_linking_to(page.url).join(', ')}"
      end
    end
  end
end

exit success
