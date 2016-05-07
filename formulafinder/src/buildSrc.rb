require 'json'

$gherbs = Array.new
$gherbs_dose = Array.new
formulas = Hash.new

def parseIng(arr)
	if arr.strip == "-"
		return {}
	end
	ing = arr.split("\t").map(&:strip)
	ll = ((ing.size % 3) == 0)? (ing.size / 3) : (ing.size / 3) + 1
	tmp = Array.new
	(1..ll).each do |i|
		herbName = ing[i*3-3] || ""
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
		mying[hb[:name]] = {:dose => hb[:num], :measure => hb[:scale], :id => i + 1}
		$gherbs.push(hb[:name])
		$gherbs_dose.push("#{hb[:name]}#{hb[:num]}")
	end
	
	mying
end

def addSynonym(hash)
	rst = hash.dup
	hash.each_key do | herb |
		$chageSrc.each do |a, b|
			if ( herb =~ a ) == 0
				rst[ b ] = hash[herb]
				$gherbs.push( b )
				$gherbs_dose.push("#{ b }#{ hash[herb][:dose] }")
			end
		end
	end	
	rst
end

#====

$chageSrc = File.open("data/herbSynonym.tsv").read.split(/\r?\n/).map do |x|
	_x = x.split("\t")
	
	[/^(#{_x[0].strip})$/, _x[1].strip]
end

data = File.open("data/data.tsv", 'r').read.gsub("﻿", "").split("\n\n").each_with_index do | pg, i | 
	_pgs = pg.split(/\r?\n/)
	txNameKr, txName = _pgs[1].split(";").map(&:strip)
	rst = {
		:id => i,
		:no => _pgs[0].strip,
		:txName => txName,
		:txFangi => _pgs[2].strip,
		:txGoo => _pgs[3].strip,
		:ingOrg => parseIng( _pgs[4].strip )
	}
	rst[:ing] = addSynonym( rst[:ingOrg] )
	formulas[txNameKr.to_sym] = rst
	
end

$gherbs.uniq!
$gherbs_dose.uniq!

herbs = Hash.new
yackzing = Hash.new
symp = Hash.new
File.open("data/symptoms.tsv", 'r').read.gsub("﻿", "").split("\n").each do |sm|
	tmp = sm.split("\t")
	symp[tmp[0]] = {:org => tmp[1] }
end

File.open("data/yackzing.tsv", 'r').read.gsub("﻿", "").split("\n").each do |line|
	herbName = String.new
	tmp = line.split("\t").map(&:strip)
	herbName = tmp[0]
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
	formulas[k][:ing].each_key do |kk|	# K: 처방명, KK: 본초명
		re_list[kk] ||= Array.new
		re_list[kk] << k
		tmp_dose = "#{kk}#{formulas[k][:ing][kk][:dose]}"
		unless kk == tmp_dose
			re_list_dose[tmp_dose] ||= Array.new
			re_list_dose[tmp_dose] << k
		end
	end
end

$gherbs.each do |ghb|
	herbs[ghb] = {
		:txYG => ( yackzing[ghb] ? yackzing[ghb][:desc] : "" ),
		:link => re_list[ghb]
	}
end

$gherbs_dose.each do |ghb|
	herbs[ghb] = {
		:link => re_list_dose[ghb]
	}
end

# File.open("tmp_re_list_dose", 'w').puts( re_list_dose.to_json )
# File.open("tmp_re_list", 'w').puts( re_list.to_json )

result = File.open("sanghan_formulas.json", 'w')
rst = Hash.new
rst[:formulas] = formulas
rst[:herbs] = herbs
rst[:symptoms] = symp
rst_json = rst.to_json
rst_json_str = rst_json.to_s.gsub(/(\d)\.(\d)/, '\1,\2')
result.puts(rst_json_str)

result2 = File.open("sanghan_herbs.json", 'w')
result2.puts($gherbs.uniq.inspect)



