import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline, List, ListOrdered,
    Type, Image as ImageIcon, Code, AlignLeft,
    AlignCenter, AlignRight
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const [isSourceMode, setIsSourceMode] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync external value changes to editor when not focused
    useEffect(() => {
        if (editorRef.current && document.activeElement !== editorRef.current && !isSourceMode) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value, isSourceMode]);

    const execCommand = (command: string, arg: string | undefined = undefined) => {
        if (!editorRef.current) return;

        // Ensure editor has focus before executing command
        if (document.activeElement !== editorRef.current) {
            editorRef.current.focus();
        }

        document.execCommand(command, false, arg);
        handleInput();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html);
        }
    };

    const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const handleImageBtnClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            if (isSourceMode) {
                const imgTag = `<img src="${imageUrl}" alt="Uploaded Image" />`;
                onChange(value + imgTag);
            } else {
                // Insert image using execCommand to place it at cursor
                // Special handling: focus editor if needed
                if (document.activeElement !== editorRef.current) {
                    editorRef.current?.focus();
                }
                document.execCommand('insertImage', false, imageUrl);
                handleInput();
            }
            e.target.value = ''; // Reset input
        }
    };

    const toggleSourceMode = () => {
        setIsSourceMode(!isSourceMode);
    };

    // Toolbar Button Component
    const ToolbarBtn = ({
        icon: Icon,
        title,
        onClick,
        active = false
    }: {
        icon: any,
        title: string,
        onClick: () => void,
        active?: boolean
    }) => (
        <button
            type="button"
            onMouseDown={(e) => {
                // Critical: Prevent default mousedown to stop focus stealing
                e.preventDefault();
                onClick();
            }}
            className={`p-2 rounded hover:bg-slate-200 transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}`}
            title={title}
            disabled={isSourceMode && title !== 'Kaynak Kodu (HTML)' && title !== 'Kaynak kapa'}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-50 border-b border-slate-300 p-2">
                <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
                    <ToolbarBtn
                        icon={Code}
                        title="Kaynak Kodu (HTML)"
                        onClick={toggleSourceMode}
                        active={isSourceMode}
                    // Always enabled to allow toggling back
                    />
                </div>

                {/* Visual Editor Toolbar Items - Dimmed when in Source Mode */}
                <div className={`flex items-center gap-1 ${isSourceMode ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                    <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
                        {/* Simplified Headings */}
                        <ToolbarBtn icon={Type} title="Başlık" onClick={() => execCommand('formatBlock', 'H2')} />
                    </div>

                    <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
                        <ToolbarBtn icon={Bold} title="Kalın" onClick={() => execCommand('bold')} />
                        <ToolbarBtn icon={Italic} title="İtalik" onClick={() => execCommand('italic')} />
                        <ToolbarBtn icon={Underline} title="Altı Çizili" onClick={() => execCommand('underline')} />
                    </div>

                    <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
                        <ToolbarBtn icon={AlignLeft} title="Sola Hizala" onClick={() => execCommand('justifyLeft')} />
                        <ToolbarBtn icon={AlignCenter} title="Ortala" onClick={() => execCommand('justifyCenter')} />
                        <ToolbarBtn icon={AlignRight} title="Sağa Hizala" onClick={() => execCommand('justifyRight')} />
                    </div>

                    <div className="flex items-center gap-0.5 border-r border-slate-300 pr-2 mr-2">
                        <ToolbarBtn icon={ListOrdered} title="Numaralı Liste" onClick={() => execCommand('insertOrderedList')} />
                        <ToolbarBtn icon={List} title="Madde İşaretli Liste" onClick={() => execCommand('insertUnorderedList')} />
                    </div>

                    <div className="flex items-center gap-0.5">
                        <ToolbarBtn icon={ImageIcon} title="Görsel Yükle" onClick={handleImageBtnClick} />
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative">
                {isSourceMode ? (
                    <textarea
                        ref={textareaRef}
                        className="w-full h-80 p-4 font-mono text-sm bg-slate-900 text-slate-200 resize-y focus:outline-none"
                        value={value}
                        onChange={handleSourceChange}
                        placeholder="HTML kodunuzu buraya yazın..."
                    />
                ) : (
                    <div
                        ref={editorRef}
                        className="w-full h-80 p-4 overflow-y-auto prose prose-sm max-w-none focus:outline-none min-h-[320px]"
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleInput}
                        dangerouslySetInnerHTML={{ __html: value }}
                    />
                )}

                {!value && !isSourceMode && (
                    <div className="absolute top-4 left-4 text-slate-400 pointer-events-none select-none">
                        Ürün özelliklerini ve detaylarını buraya yazın...
                    </div>
                )}
            </div>

            <div className="bg-slate-50 p-2 text-xs text-slate-500 border-t border-slate-200 flex justify-between">
                <span>{isSourceMode ? 'HTML Modu' : 'Görsel Mod'}</span>
                <span>{value.length} karakter</span>
            </div>
        </div>
    );
};
