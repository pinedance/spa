require 'json'

data = File.open("data/data.tsv", 'r').read.gsub("﻿", "").split("\n").map{|line| line.split("\t|\t") }

$chageSrc = [[/^(망초|박초|융염)$/, "망초;박초;융염"], [/^(백밀|밀)$/, "밀;꿀"], [/^(부자|천오|천웅)$/, "부자;천오;천웅"], [/^(청주|백주|미청주)$/, "청주;백주;미청주"],  [/^(생강|생강즙)$/, "생강;즙"]]

def gsubs(str, arr)
	_result = str.dup
	arr.each do |a|
		_result = _result.gsub(a[0], a[1])
	end
	_result
end

$gherbs = Array.new
$gherbs_dose = Array.new

def parseIng(arr)
	ing = arr.split("\t").map(&:strip)
	ll = ((ing.size % 3) == 0)? (ing.size / 3) : (ing.size / 3) + 1
	tmp = Array.new
	(1..ll).each do |i|
		herbName = ing[i*3-3]? gsubs(ing[i*3-3], $chageSrc) : ""
		tmp << {name: (herbName), num: (ing[i*3-2]||""), scale: (ing[i*3-1]||"")}
	end
	
	tmp_rev = tmp.reverse
	(0...ll).each do |j|
		if tmp_rev[j][:num] == ""
			tmp_rev[j][:num] = tmp_rev[j-1][:num]
			tmp_rev[j][:scale] = tmp_rev[j-1][:scale]
		elsif tmp_rev[j][:scale] == ""
			tmp_rev[j][:scale] = "兩"
		end
	end
	
	tmp_rev_rev = tmp_rev.reverse
	mying = Hash.new
	tmp_rev_rev.each_with_index do |hb, i|
		mying[hb[:name]] = {"dose" => hb[:num], "measure" => hb[:scale], "id" => i + 1}
		$gherbs.push(hb[:name])
		$gherbs_dose.push("#{hb[:name]}#{hb[:num]}")
	end
	
	mying
end

formulas = Hash.new
data.each_with_index do |ln, i|
	no, kyName, txName, txFangi, txGoo = ln[0].split("\t").map(&:strip)
	if ln[1]
		ing = (ln[1].strip == "")? {} : parseIng(ln[1].strip)
	else
		ing = {}
	end

	formulas[kyName] = {
		"id" => i, 
		"no" => no,
		"txName" => txName,
		"txFangi" => txFangi,
		"txGoo" => txGoo,
		"ing" => ing
	}
end


$gherbs.uniq!
$gherbs_dose.uniq!
herbs = Hash.new
yackzing = Hash.new
symp = Hash.new
File.open("data/symptoms.tsv", 'r').read.gsub("﻿", "").split("\n").each do |sm|
	tmp = sm.split("\t")
	symp[tmp[0]] = Hash.new
	symp[tmp[0]][:org] = tmp[1]
end

File.open("data/yackzing.tsv", 'r').read.gsub("﻿", "").split("\n").each do |line|
	herbName = String.new
	tmp = line.split("\t").map(&:strip)
	herbName = gsubs(tmp[0], $chageSrc)
	yackzing[herbName] = {
		:org_name => tmp[1],
		:desc => tmp[2]
	}
	symp.each_key do |ss|
		if tmp[2].include?(symp[ss][:org])
			symp[ss][:herbs] ||= Array.new
			symp[ss][:herbs].push(herbName)
		end
	end
end

re_list = Hash.new
re_list_dose = Hash.new

formulas.each_key do |k|
	formulas[k]["ing"].each_key do |kk|
		re_list[kk] ||= Array.new
		re_list[kk] << k
		tmp_dose = "#{kk}#{formulas[k]["ing"][kk]["dose"]}"
		re_list_dose[tmp_dose] ||= Array.new
		re_list_dose[tmp_dose] << k
	end
end

$gherbs.each do |ghb|
	herbs[ghb] = {
		"txYG" => ( yackzing[ghb] ? yackzing[ghb][:desc] : "" ),
		"link" => re_list[ghb]
	}
end

$gherbs_dose.each do |ghb|
	herbs[ghb] = {
		"link" => re_list_dose[ghb]
	}
end

result = File.open("sanghan_formulas.json", 'w')
rst = Hash.new
rst["formulas"] = formulas
rst["herbs"] = herbs
rst["symptoms"] = symp
rst_json = rst.to_json
rst_json_str = rst_json.to_s.gsub(/(\d)\.(\d)/, '\1,\2')
result.puts(rst_json_str)

result2 = File.open("sanghan_herbs.json", 'w')
result2.puts($gherbs.uniq.inspect)



