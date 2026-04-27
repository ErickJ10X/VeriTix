local function is_latex()
  return FORMAT:match('latex') ~= nil
end

local function escape_latex(text)
  local replacements = {
    ['\\'] = '\\textbackslash{}',
    ['{'] = '\\{',
    ['}'] = '\\}',
    ['$'] = '\\$',
    ['&'] = '\\&',
    ['#'] = '\\#',
    ['_'] = '\\_',
    ['%'] = '\\%',
    ['~'] = '\\textasciitilde{}',
    ['^'] = '\\textasciicircum{}',
  }

  return (text:gsub('[\\{}$&#_%%~^]', function(char)
    return replacements[char] or char
  end))
end

local function has_class(element, class_name)
  for _, class in ipairs(element.classes or {}) do
    if class == class_name then
      return true
    end
  end
  return false
end

local function first_image_in_blocks(blocks)
  for _, block in ipairs(blocks or {}) do
    if block.t == 'Para' or block.t == 'Plain' then
      for _, inline in ipairs(block.content or {}) do
        if inline.t == 'Image' then
          return inline
        end
      end
    elseif block.t == 'Figure' then
      local image = first_image_in_blocks(block.content or block.c or {})
      if image then
        return image
      end
    end
  end

  return nil
end

local function format_header_cell(cell)
  local text = pandoc.utils.stringify(cell.contents or cell.content or {})
  local content = pandoc.Blocks({
    pandoc.Plain({
      pandoc.RawInline('latex', '\\focheadcell{' .. escape_latex(text) .. '}')
    })
  })

  cell.contents = content
  cell.content = content
  return cell
end

function Table(tbl)
  if not is_latex() then
    return nil
  end

  local head_rows = tbl.head and (tbl.head.rows or tbl.head.content or tbl.head.c)
  if head_rows then
    for _, row in ipairs(head_rows) do
      local cells = row.cells or row.content or row.c or {}
      for _, cell in ipairs(cells) do
        format_header_cell(cell)
      end
    end
  end

  return tbl
end

function Div(div)
  if not is_latex() or not has_class(div, 'latex-figure') then
    return nil
  end

  local image = first_image_in_blocks(div.content)
  if not image then
    return nil
  end

  local needspace = div.attributes.needspace or ''
  local width = div.attributes.width or '0.92\\linewidth'
  local image_src = image.src
  local caption = pandoc.utils.stringify(image.caption or {})

  local lines = {}
  if needspace ~= '' then
    table.insert(lines, '\\Needspace{' .. needspace .. '\\baselineskip}')
  end

  table.insert(lines, '\\begin{figure}[!htbp]')
  table.insert(lines, '\\centering')

  local includegraphics = '\\includegraphics[width=' .. width
  includegraphics = includegraphics .. ']'
  includegraphics = includegraphics .. '{' .. escape_latex(image_src) .. '}'

  table.insert(lines, includegraphics)
  if caption ~= '' then
    table.insert(lines, '\\caption{' .. escape_latex(caption) .. '}')
  end
  table.insert(lines, '\\end{figure}')

  return { pandoc.RawBlock('latex', table.concat(lines, '\n')) }
end
