import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

type BlockType = 'text' | 'image' | 'video' | 'link';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  linkText?: string; // For custom link display text
  // Text-specific styles
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color?: string;
  minHeight?: number;
}

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);

  const addBlock = (type: BlockType, content: string = 'Ketik di sini...') => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content,
      ...(type === 'text' && { 
        textAlign: 'left',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#333333',
        minHeight: 40
      }),
    };
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
  };

  const updateBlockContent = (id: string, newContent: string) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, content: newContent } : block
      )
    );
  };

  const updateBlockStyle = (id: string, newStyles: Partial<Pick<Block, 'textAlign' | 'fontSize' | 'fontWeight' | 'fontStyle' | 'textDecoration' | 'color'>>) => {
    setBlocks(blocks =>
      blocks.map(block => (block.id === id ? { ...block, ...newStyles } : block))
    );
  };

  const handleToggleStyle = (id: string, style: 'fontWeight' | 'fontStyle' | 'textDecoration', activeValue: string, defaultValue: string) => {
    setBlocks(blocks =>
      blocks.map(block => {
        if (block.id === id) {
          const currentBlock = block as any;
          const currentVal = currentBlock[style];
          return { ...block, [style]: currentVal === activeValue ? defaultValue : activeValue };
        }
        return block;
      })
    );
  };
  
  const handleFontSizeChange = (id: string, amount: number) => {
    setBlocks(blocks =>
      blocks.map(block => {
        if (block.id === id) {
          const currentSize = block.fontSize || 16;
          const newSize = Math.max(8, Math.min(72, currentSize + amount));
          return { ...block, fontSize: newSize };
        }
        return block;
      })
    );
  };

  const handleHeightChange = (id: string, amount: number) => {
    setBlocks(blocks =>
      blocks.map(block => {
        if (block.id === id) {
          const currentHeight = block.minHeight || 40;
          const newHeight = Math.max(40, Math.min(400, currentHeight + amount));
          return { ...block, minHeight: newHeight };
        }
        return block;
      })
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
  };

  const handleAddMediaClick = (type: 'image' | 'video') => {
    setFileType(type);
    fileInputRef.current?.click();
    setShowAddOptions(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && fileType) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        addBlock(fileType, result);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };
  
  const handleAddTextClick = () => {
    addBlock('text');
    setShowAddOptions(false);
  };

  const handleAddLinkClick = () => {
    const url = prompt("Masukkan URL tautan:");
    if (url && url.trim() !== '') {
      const linkText = prompt("Masukkan teks yang akan ditampilkan (kosongkan untuk menggunakan URL):");
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type: 'link',
        content: url.trim(),
        linkText: linkText && linkText.trim() !== '' ? linkText.trim() : undefined
      };
      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    } else if (url !== null) {
      alert("URL tidak boleh kosong.");
    }
    setShowAddOptions(false);
  };

  const handleExport = () => {
    const getExportCss = () => `
      :root {
        --primary-color: #4a90e2;
        --dark-gray-color: #6b778c;
        --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        --border-radius: 8px;
      }
      body {
        margin: 0;
        padding: 2rem;
        font-family: var(--font-family);
        background-color: #f7f9fc;
        color: #333;
        display: flex;
        justify-content: center;
      }
      main {
        width: 100%;
        max-width: 800px;
      }
      .block {
        padding: 24px;
        background-color: #ffffff;
        border-radius: var(--border-radius);
        margin-bottom: 24px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .text-block {
        line-height: 1.6;
        overflow-wrap: break-word;
      }
      .media-block img, .media-block video {
        max-width: 100%;
        height: auto;
        display: block;
        border-radius: calc(var(--border-radius) - 2px);
      }
      .link-block a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        word-break: break-all;
        position: relative;
        padding-right: 24px;
      }
      .link-block a::after {
        content: 'open_in_new';
        font-family: 'Material Symbols Outlined';
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        font-size: 18px;
        font-weight: normal;
        color: var(--dark-gray-color);
      }
    `;

    const blocksHtml = blocks.map(block => {
      let classes = `block ${block.type}-block`;
      switch (block.type) {
        case 'text':
          const textStyles = [
            `text-align: ${block.textAlign || 'left'}`,
            `font-size: ${block.fontSize ? `${block.fontSize}px` : '16px'}`,
            `font-weight: ${block.fontWeight || 'normal'}`,
            `font-style: ${block.fontStyle || 'normal'}`,
            `text-decoration: ${block.textDecoration || 'none'}`,
            `color: ${block.color || '#333333'}`,
            `min-height: ${block.minHeight ? `${block.minHeight}px` : '40px'}`
          ].join('; ');
          return `<div class="${classes}" style="${textStyles}">${block.content}</div>`;
        case 'image':
          return `<div class="${classes}"><img src="${block.content}" alt="User content" style="max-width: 100%; height: auto;"></div>`;
        case 'video':
          return `<div class="${classes}"><video src="${block.content}" controls style="max-width: 100%;"></video></div>`;
        case 'link':
          return `<div class="${classes}"><a href="${block.content}" target="_blank" rel="noopener noreferrer" title="${block.content}">${block.linkText || block.content}</a></div>`;
      }
    }).join('\n');

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Halaman Arahan</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          ${getExportCss()}
        </style>
      </head>
      <body>
        <main>
          ${blocksHtml}
        </main>
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml.trim()], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'landing-page.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };


  const ContentBlock: React.FC<{ block: Block }> = ({ block }) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            className={`content-block text-block`}
            style={{
              textAlign: block.textAlign || 'left',
              fontSize: block.fontSize ? `${block.fontSize}px` : '16px',
              fontWeight: block.fontWeight || 'normal',
              fontStyle: block.fontStyle || 'normal',
              textDecoration: block.textDecoration || 'none',
              color: block.color || 'inherit',
              minHeight: block.minHeight ? `${block.minHeight}px` : '40px',
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );
      case 'image':
        return (
          <div className="content-block media-block">
            <img src={block.content} alt="User uploaded content" />
          </div>
        );
      case 'video':
        return (
          <div className="content-block media-block">
            <video src={block.content} controls />
          </div>
        );
      case 'link':
        return (
          <div className="content-block link-block">
            <a href={block.content} target="_blank" rel="noopener noreferrer">
              {block.content}
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="app-header">
        <h1>Halaman Arahan Dinamis</h1>
        <button onClick={handleExport} className="export-btn">
          <span className="material-symbols-outlined">download</span>
          Ekspor ke HTML
        </button>
      </header>

      <main className="content-area">
        {blocks.length === 0 ? (
          <div className="placeholder">
            <span className="material-symbols-outlined">widgets</span>
            <h2>Halaman Anda masih kosong.</h2>
            <p>Klik tombol `+` di kanan bawah untuk mulai menambahkan konten.</p>
          </div>
        ) : (
          blocks.map(block => (
            <div key={block.id} className="block-wrapper">
              <button className="delete-btn" onClick={() => deleteBlock(block.id)}>
                <span className="material-symbols-outlined" style={{fontSize: '18px'}}>close</span>
              </button>
              {block.type === 'text' && (
                <div className="text-toolbar">
                  <button onClick={() => updateBlockStyle(block.id, { textAlign: 'left' })} className={block.textAlign === 'left' ? 'active' : ''} aria-label="Align left"><span className="material-symbols-outlined">format_align_left</span></button>
                  <button onClick={() => updateBlockStyle(block.id, { textAlign: 'center' })} className={block.textAlign === 'center' ? 'active' : ''} aria-label="Align center"><span className="material-symbols-outlined">format_align_center</span></button>
                  <button onClick={() => updateBlockStyle(block.id, { textAlign: 'right' })} className={block.textAlign === 'right' ? 'active' : ''} aria-label="Align right"><span className="material-symbols-outlined">format_align_right</span></button>
                  <div className="divider"></div>
                  <button onClick={() => handleToggleStyle(block.id, 'fontWeight', 'bold', 'normal')} className={block.fontWeight === 'bold' ? 'active' : ''} aria-label="Bold"><span className="material-symbols-outlined">format_bold</span></button>
                  <button onClick={() => handleToggleStyle(block.id, 'fontStyle', 'italic', 'normal')} className={block.fontStyle === 'italic' ? 'active' : ''} aria-label="Italic"><span className="material-symbols-outlined">format_italic</span></button>
                  <button onClick={() => handleToggleStyle(block.id, 'textDecoration', 'underline', 'none')} className={block.textDecoration === 'underline' ? 'active' : ''} aria-label="Underline"><span className="material-symbols-outlined">format_underlined</span></button>
                  <div className="divider"></div>
                  <button onClick={() => handleFontSizeChange(block.id, -2)} aria-label="Decrease font size"><span className="material-symbols-outlined">text_decrease</span></button>
                  <span className="font-size-display">{block.fontSize || 16}px</span>
                  <button onClick={() => handleFontSizeChange(block.id, 2)} aria-label="Increase font size"><span className="material-symbols-outlined">text_increase</span></button>
                  <div className="divider"></div>
                  <button onClick={() => handleHeightChange(block.id, -20)} aria-label="Decrease height"><span className="material-symbols-outlined">unfold_less</span></button>
                  <span className="height-display">{block.minHeight || 40}px</span>
                  <button onClick={() => handleHeightChange(block.id, 20)} aria-label="Increase height"><span className="material-symbols-outlined">unfold_more</span></button>
                  <div className="divider"></div>
                  <div className="color-picker-wrapper" style={{ backgroundColor: block.color }}>
                    <input
                      type="color"
                      value={block.color || '#333333'}
                      onChange={(e) => updateBlockStyle(block.id, { color: e.target.value })}
                      aria-label="Change text color"
                      title="Ubah warna teks"
                    />
                  </div>
                </div>
              )}
              <ContentBlock block={block} />
            </div>
          ))
        )}
      </main>

      <div className="add-controls">
        <div className={`add-options ${!showAddOptions ? 'hidden' : ''}`}>
           <button onClick={handleAddTextClick}>
             <span className="material-symbols-outlined">edit_note</span>
             Teks
           </button>
           <button onClick={() => handleAddMediaClick('image')}>
             <span className="material-symbols-outlined">image</span>
             Gambar
           </button>
           <button onClick={() => handleAddMediaClick('video')}>
             <span className="material-symbols-outlined">videocam</span>
             Video
           </button>
           <button onClick={handleAddLinkClick}>
             <span className="material-symbols-outlined">link</span>
             URL
           </button>
        </div>
        <button 
          className="add-main-btn" 
          onClick={() => setShowAddOptions(!showAddOptions)}
          aria-label="Add content"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={fileType === 'image' ? 'image/*' : 'video/*'}
      />
    </>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}