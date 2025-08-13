import { app } from "../../scripts/app.js";

// Simple function to create DOM elements
function createEl(tag, className = "", text = "") {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

app.registerExtension({
    name: "PromptSE.Extension",
    
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "PromptSE") {
            console.log("PromptSE: Registering node");
            
            const origOnNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function() {
                const r = origOnNodeCreated ? origOnNodeCreated.apply(this, arguments) : undefined;
                
                try {
                    // Prevent duplicate initialization
                    if (this.promptse_initialized) {
                        console.log("PromptSE: Already initialized, skipping");
                        return r;
                    }
                    
                    console.log("PromptSE: Node created, initializing UI");
                    this.promptse_initialized = true;
                    
                    // Initialize node data with weight support
                    this.promptse_data = {
                        entries: [
                            { id: "entry1", title: "Character", content: "beautiful girl, long hair", enabled: true, weight: 1.0 },
                            { id: "entry2", title: "Style", content: "anime style, high quality", enabled: true, weight: 1.2 },
                            { id: "entry3", title: "Details", content: "detailed, masterpiece", enabled: false, weight: 1.0 }
                        ],
                        settings: {
                            connector: ", ",
                            mode: "M",
                            weightFormat: "parentheses" // parentheses, brackets, none
                        },
                        lexicon: []
                    };
                    
                    // Language system
                    this.language = "zh"; // zh or en
                    this.texts = {
                        zh: {
                            title: "PromptSE",
                            import: "导入词库",
                            settings: "设置",
                            editEntry: "编辑条目",
                            lexicon: "词库",
                            searchTags: "搜索标签...",
                            noResults: "未找到匹配标签",
                            noLexicon: "未加载词库",
                            english: "英文",
                            chinese: "中文",
                            title_label: "标题:",
                            content_label: "内容:",
                            weight_label: "权重:",
                            save: "保存",
                            cancel: "取消",
                            mode: "模式",
                            add: "添加",
                            remove: "移除",
                            output: "输出:",
                            connector: "连接符:",
                            comma: "逗号",
                            newLine: "换行",
                            pipe: "管道",
                            space: "空格",
                            weightFormat: "权重格式:",
                            noFormat: "无格式",
                            dataManagement: "数据管理:",
                            exportConfig: "导出配置",
                            resetDefault: "重置默认",
                            language: "语言:",
                            resetConfirm: "重置所有设置为默认值？此操作无法撤销。",
                            importSuccess: "成功导入 {count} 个词库条目！",
                            entryExists: "此条目已存在！",
                            parseError: "解析词库文件出错，请检查格式。"
                        },
                        en: {
                            title: "PromptSE",
                            import: "Import Lexicon",
                            settings: "Settings",
                            editEntry: "Edit Entry",
                            lexicon: "Lexicon",
                            searchTags: "Search tags...",
                            noResults: "No matching tags found",
                            noLexicon: "No lexicon loaded",
                            english: "English",
                            chinese: "Chinese",
                            title_label: "Title:",
                            content_label: "Content:",
                            weight_label: "Weight:",
                            save: "Save",
                            cancel: "Cancel",
                            mode: "Mode",
                            add: "Add",
                            remove: "Remove",
                            output: "Output:",
                            connector: "Connector:",
                            comma: "Comma",
                            newLine: "New Line",
                            pipe: "Pipe",
                            space: "Space",
                            weightFormat: "Weight Format:",
                            noFormat: "No Format",
                            dataManagement: "Data Management:",
                            exportConfig: "Export Config",
                            resetDefault: "Reset to Default",
                            language: "Language:",
                            resetConfirm: "Reset all settings to default? This cannot be undone.",
                            importSuccess: "Successfully imported {count} lexicon entries!",
                            entryExists: "This entry already exists!",
                            parseError: "Error parsing lexicon file. Please check the format."
                        }
                    };
                    
                    // Get text function
                    this.getText = (key, params = {}) => {
                        let text = this.texts[this.language][key] || key;
                        Object.keys(params).forEach(param => {
                            text = text.replace(`{${param}}`, params[param]);
                        });
                        return text;
                    };
                    
                    // Create hidden widget to store data
                    const dataWidget = this.addWidget("text", "promptse_data", JSON.stringify(this.promptse_data), (value) => {
                        console.log("PromptSE: Widget value changed:", value);
                    }, {
                        serialize: true
                    });
                    // Hide the widget from UI
                    if (dataWidget) {
                        dataWidget.hidden = true;
                        dataWidget.computeSize = () => [0, 0];
                    }
                    
                    // Create main container with flat styling and proper sizing
                    const container = createEl("div", "promptse-container");
                    container.style.cssText = `
                        width: 100%;
                        height: 100%;
                        min-height: 350px;
                        padding: 12px;
                        background: #2b2b2b;
                        border: 1px solid #444;
                        border-radius: 4px;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        color: #ffffff;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                    `;
                    
                    // Create header with flat design
                    const header = createEl("div", "promptse-header");
                    header.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                        padding-bottom: 8px;
                        border-bottom: 1px solid #444;
                    `;
                    
                    const title = createEl("span", "", this.getText("title"));
                    title.style.cssText = `
                        font-weight: 500;
                        font-size: 14px;
                        color: #cccccc;
                    `;
                    
                    const toolbar = createEl("div", "promptse-toolbar");
                    toolbar.style.cssText = `
                        display: flex;
                        gap: 8px;
                        align-items: center;
                    `;
                    
                    // Import lexicon button
                    const importBtn = createEl("button", "", "📁");
                    importBtn.title = this.getText("import");
                    importBtn.style.cssText = `
                        padding: 4px 8px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 12px;
                    `;
                    importBtn.onclick = () => {
                        this.importLexicon();
                    };
                    
                    // Settings button
                    const settingsBtn = createEl("button", "", "⚙️");
                    settingsBtn.title = this.getText("settings");
                    settingsBtn.style.cssText = `
                        padding: 4px 8px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 12px;
                    `;
                    settingsBtn.onclick = () => {
                        this.openSettingsPanel();
                    };
                    
                    toolbar.appendChild(importBtn);
                    toolbar.appendChild(settingsBtn);
                    header.appendChild(title);
                    header.appendChild(toolbar);
                    
                    // Create entries list with adaptive height
                    const entriesList = createEl("div", "promptse-entries");
                    entriesList.style.cssText = `
                        margin-bottom: 12px;
                        flex: 1;
                        min-height: 120px;
                        overflow-y: auto;
                        border: 1px solid #444;
                        border-radius: 2px;
                        padding: 6px;
                        background: #333;
                    `;
                    
                    // Function to create weight controls
                    this.createWeightControls = (entry, index) => {
                        const weightContainer = createEl("div", "weight-controls");
                        weightContainer.style.cssText = `
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            margin-left: 8px;
                        `;
                        
                        const decreaseBtn = createEl("button", "", "-");
                        decreaseBtn.style.cssText = `
                            width: 18px;
                            height: 18px;
                            border: 1px solid #666;
                            border-radius: 2px;
                            background: #444;
                            color: #ccc;
                            font-size: 11px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        `;
                        decreaseBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.promptse_data.entries[index].weight = Math.max(0.1, (this.promptse_data.entries[index].weight - 0.1));
                            this.renderPromptseEntries();
                            this.triggerSlotChanged();
                        };
                        
                        const weightDisplay = createEl("span", "", entry.weight.toFixed(1));
                        weightDisplay.style.cssText = `
                            min-width: 24px;
                            text-align: center;
                            font-size: 10px;
                            color: #aaa;
                            font-weight: 400;
                        `;
                        
                        const increaseBtn = createEl("button", "", "+");
                        increaseBtn.style.cssText = `
                            width: 18px;
                            height: 18px;
                            border: 1px solid #666;
                            border-radius: 2px;
                            background: #444;
                            color: #ccc;
                            font-size: 11px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        `;
                        increaseBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.promptse_data.entries[index].weight = Math.min(3.0, (this.promptse_data.entries[index].weight + 0.1));
                            this.renderPromptseEntries();
                            this.triggerSlotChanged();
                        };
                        
                        weightContainer.appendChild(decreaseBtn);
                        weightContainer.appendChild(weightDisplay);
                        weightContainer.appendChild(increaseBtn);
                        
                        return weightContainer;
                    };
                    
                    // Function to render entries with modern cards
                    this.renderPromptseEntries = () => {
                        entriesList.innerHTML = "";
                        this.promptse_data.entries.forEach((entry, index) => {
                            const entryCard = createEl("div", "promptse-entry");
                            entryCard.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                padding: 8px;
                                margin-bottom: 4px;
                                background: ${entry.enabled ? '#3a3a3a' : '#2a2a2a'};
                                border: 1px solid ${entry.enabled ? '#555' : '#444'};
                                border-radius: 2px;
                                cursor: pointer;
                            `;
                            
                            // Simple hover effect
                            entryCard.onmouseenter = () => {
                                entryCard.style.background = entry.enabled ? '#404040' : '#333';
                            };
                            entryCard.onmouseleave = () => {
                                entryCard.style.background = entry.enabled ? '#3a3a3a' : '#2a2a2a';
                            };
                            
                            // Header row with drag handle, checkbox, title, and weight controls
                            const headerRow = createEl("div", "entry-header");
                            headerRow.style.cssText = `
                                display: flex;
                                align-items: center;
                                margin-bottom: 8px;
                            `;
                            
                            // Drag handle
                            const dragHandle = createEl("span", "", "≡");
                            dragHandle.style.cssText = `
                                cursor: move;
                                color: #666;
                                margin-right: 8px;
                                font-size: 14px;
                                width: 16px;
                                text-align: center;
                                user-select: none;
                            `;
                            dragHandle.title = "Drag to reorder";
                            
                            // Checkbox
                            const checkbox = createEl("input");
                            checkbox.type = "checkbox";
                            checkbox.checked = entry.enabled;
                            checkbox.style.cssText = `
                                margin-right: 8px;
                                transform: scale(1.0);
                            `;
                            checkbox.onchange = (e) => {
                                console.log("PromptSE: Checkbox changed for entry", index, "enabled:", e.target.checked);
                                
                                if (this.promptse_data.settings.mode === "S" && e.target.checked) {
                                    // In Single mode, only one entry can be enabled at a time
                                    this.promptse_data.entries.forEach((entry, i) => {
                                        entry.enabled = (i === index);
                                    });
                                } else {
                                    this.promptse_data.entries[index].enabled = e.target.checked;
                                }
                                
                                this.renderPromptseEntries();
                                this.triggerSlotChanged();
                            };
                            
                            // Title
                            const title = createEl("span", "", entry.title);
                            title.style.cssText = `
                                font-weight: 500;
                                font-size: 12px;
                                color: ${entry.enabled ? '#ddd' : '#888'};
                                flex: 1;
                            `;
                            
                            // Weight controls
                            const weightControls = this.createWeightControls(entry, index);
                            
                            headerRow.appendChild(dragHandle);
                            headerRow.appendChild(checkbox);
                            headerRow.appendChild(title);
                            headerRow.appendChild(weightControls);
                            
                            // Setup drag and drop
                            entryCard.draggable = true;
                            entryCard.setAttribute('data-index', index);
                            
                            entryCard.ondragstart = (e) => {
                                e.dataTransfer.setData('text/plain', index);
                                entryCard.style.opacity = '0.5';
                                console.log('PromptSE: Drag started for index:', index);
                            };
                            
                            entryCard.ondragend = (e) => {
                                entryCard.style.opacity = '1';
                            };
                            
                            entryCard.ondragover = (e) => {
                                e.preventDefault();
                                entryCard.style.borderTop = '2px solid #4a90e2';
                            };
                            
                            entryCard.ondragleave = (e) => {
                                entryCard.style.borderTop = '';
                            };
                            
                            entryCard.ondrop = (e) => {
                                e.preventDefault();
                                entryCard.style.borderTop = '';
                                
                                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                const targetIndex = index;
                                
                                if (draggedIndex !== targetIndex) {
                                    console.log('PromptSE: Moving entry from', draggedIndex, 'to', targetIndex);
                                    this.moveEntry(draggedIndex, targetIndex);
                                }
                            };
                            
                            // Content preview
                            const contentPreview = createEl("div", "", entry.content.substring(0, 50) + (entry.content.length > 50 ? "..." : ""));
                            contentPreview.style.cssText = `
                                color: ${entry.enabled ? '#aaa' : '#666'};
                                font-size: 11px;
                                margin-left: 22px;
                                line-height: 1.3;
                            `;
                            
                            entryCard.appendChild(headerRow);
                            entryCard.appendChild(contentPreview);
                            
                            // Edit on click (excluding controls)
                            entryCard.onclick = (e) => {
                                if (e.target !== checkbox && !e.target.closest('.weight-controls')) {
                                    this.editPromptseEntry(index);
                                }
                            };
                            
                            entriesList.appendChild(entryCard);
                        });
                        
                        // Update output preview
                        this.updateOutputPreview();
                    };
                    
                    // Function to format content with weight
                    this.formatContentWithWeight = (content, weight) => {
                        const format = this.promptse_data.settings.weightFormat;
                        if (format === "none" || weight === 1.0) {
                            return content;
                        }
                        
                        if (format === "parentheses") {
                            return `(${content}:${weight.toFixed(1)})`;
                        } else if (format === "brackets") {
                            return `[${content}:${weight.toFixed(1)}]`;
                        }
                        return content;
                    };
                    
                    // Function to update output preview
                    this.updateOutputPreview = () => {
                        const mode = this.promptse_data.settings.mode;
                        const connector = this.promptse_data.settings.connector;
                        const entries = this.promptse_data.entries;
                        
                        let finalParts = [];
                        
                        if (mode === "S") {
                            // Single mode: find the first enabled entry
                            for (let entry of entries) {
                                if (entry.enabled) {
                                    const formatted = this.formatContentWithWeight(entry.content, entry.weight);
                                    if (formatted.trim()) {
                                        finalParts.push(formatted);
                                    }
                                    break;
                                }
                            }
                        } else {
                            // Multiple mode: concatenate all enabled entries
                            for (let entry of entries) {
                                if (entry.enabled) {
                                    const formatted = this.formatContentWithWeight(entry.content, entry.weight);
                                    if (formatted.trim()) {
                                        finalParts.push(formatted);
                                    }
                                }
                            }
                        }
                        
                        const outputText = finalParts.join(connector);
                        if (this.outputPreview) {
                            this.outputPreview.textContent = outputText || "(no output)";
                        }
                        
                        return outputText;
                    };
                    
                    // Function to create modal editor
                    this.createModalEditor = (entry, index) => {
                        // Check if modal already exists
                        if (document.getElementById('promptse-modal')) {
                            return;
                        }
                        
                        const modal = createEl("div", "", "");
                        modal.id = 'promptse-modal';
                        modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background: rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 10000;
                        `;
                        
                        const modalContent = createEl("div", "", "");
                        modalContent.style.cssText = `
                            background: #2b2b2b;
                            border: 1px solid #555;
                            border-radius: 4px;
                            width: 400px;
                            min-height: 300px;
                            padding: 16px;
                            position: relative;
                            resize: both;
                            overflow: auto;
                        `;
                        
                        const header = createEl("div", "", "");
                        header.style.cssText = `
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 16px;
                            padding-bottom: 8px;
                            border-bottom: 1px solid #444;
                            cursor: move;
                        `;
                        
                        const title = createEl("span", "", "Edit Entry");
                        title.style.cssText = `
                            color: #ccc;
                            font-weight: 500;
                        `;
                        
                        const closeBtn = createEl("button", "", "×");
                        closeBtn.style.cssText = `
                            background: none;
                            border: none;
                            color: #ccc;
                            font-size: 20px;
                            cursor: pointer;
                            padding: 0;
                            width: 24px;
                            height: 24px;
                        `;
                        
                        header.appendChild(title);
                        header.appendChild(closeBtn);
                        
                        // Title input
                        const titleLabel = createEl("label", "", "Title:");
                        titleLabel.style.cssText = `
                            display: block;
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 4px;
                        `;
                        
                        const titleInput = createEl("input", "", "");
                        titleInput.type = "text";
                        titleInput.value = entry.title;
                        titleInput.style.cssText = `
                            width: 100%;
                            padding: 8px;
                            background: #333;
                            border: 1px solid #555;
                            border-radius: 2px;
                            color: #ccc;
                            margin-bottom: 16px;
                            box-sizing: border-box;
                        `;
                        
                        // Content input
                        const contentLabel = createEl("label", "", "Content:");
                        contentLabel.style.cssText = `
                            display: block;
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 4px;
                        `;
                        
                        const contentInput = createEl("textarea", "", "");
                        contentInput.value = entry.content;
                        contentInput.style.cssText = `
                            width: 100%;
                            height: 120px;
                            padding: 8px;
                            background: #333;
                            border: 1px solid #555;
                            border-radius: 2px;
                            color: #ccc;
                            margin-bottom: 16px;
                            resize: vertical;
                            box-sizing: border-box;
                            font-family: inherit;
                        `;
                        
                        // Weight input
                        const weightLabel = createEl("label", "", "Weight:");
                        weightLabel.style.cssText = `
                            display: block;
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 4px;
                        `;
                        
                        const weightInput = createEl("input", "", "");
                        weightInput.type = "number";
                        weightInput.min = "0.1";
                        weightInput.max = "3.0";
                        weightInput.step = "0.1";
                        weightInput.value = entry.weight;
                        weightInput.style.cssText = `
                            width: 100px;
                            padding: 8px;
                            background: #333;
                            border: 1px solid #555;
                            border-radius: 2px;
                            color: #ccc;
                            margin-bottom: 16px;
                        `;
                        
                        // Lexicon section
                        const lexiconSection = createEl("div", "", "");
                        lexiconSection.style.cssText = `
                            margin-bottom: 16px;
                            border: 1px solid #444;
                            border-radius: 2px;
                            background: #333;
                        `;
                        
                        const lexiconHeader = createEl("div", "", "");
                        lexiconHeader.style.cssText = `
                            padding: 8px;
                            border-bottom: 1px solid #444;
                            display: flex;
                            gap: 8px;
                            align-items: center;
                        `;
                        
                        const lexiconTitle = createEl("span", "", "Lexicon");
                        lexiconTitle.style.cssText = `
                            color: #aaa;
                            font-size: 12px;
                            flex: 1;
                        `;
                        
                        const searchInput = createEl("input", "", "");
                        searchInput.type = "text";
                        searchInput.placeholder = "Search tags...";
                        searchInput.style.cssText = `
                            flex: 2;
                            padding: 4px 8px;
                            background: #2a2a2a;
                            border: 1px solid #555;
                            border-radius: 2px;
                            color: #ccc;
                            font-size: 11px;
                        `;
                        
                        lexiconHeader.appendChild(lexiconTitle);
                        lexiconHeader.appendChild(searchInput);
                        
                        const lexiconList = createEl("div", "", "");
                        lexiconList.style.cssText = `
                            max-height: 120px;
                            overflow-y: auto;
                            padding: 4px;
                        `;
                        
                        const renderLexicon = (query = "") => {
                            const results = this.searchLexicon(query);
                            lexiconList.innerHTML = "";
                            
                            if (results.length === 0) {
                                const noResults = createEl("div", "", query ? "No matching tags found" : "No lexicon loaded");
                                noResults.style.cssText = `
                                    padding: 8px;
                                    color: #666;
                                    font-size: 11px;
                                    text-align: center;
                                `;
                                lexiconList.appendChild(noResults);
                                return;
                            }
                            
                            results.slice(0, 20).forEach(item => {
                                const tagItem = createEl("div", "", "");
                                tagItem.style.cssText = `
                                    padding: 4px 8px;
                                    cursor: pointer;
                                    border-radius: 2px;
                                    font-size: 11px;
                                    border-bottom: 1px solid #444;
                                `;
                                
                                const englishSpan = createEl("span", "", item.english);
                                englishSpan.style.cssText = `
                                    color: #4a90e2;
                                    margin-right: 8px;
                                `;
                                
                                const chineseSpan = createEl("span", "", item.chinese);
                                chineseSpan.style.cssText = `
                                    color: #aaa;
                                `;
                                
                                tagItem.appendChild(englishSpan);
                                tagItem.appendChild(chineseSpan);
                                
                                tagItem.onmouseenter = () => {
                                    tagItem.style.background = "#444";
                                };
                                tagItem.onmouseleave = () => {
                                    tagItem.style.background = "transparent";
                                };
                                
                                tagItem.onclick = () => {
                                    const currentContent = contentInput.value;
                                    const newContent = currentContent ?
                                        currentContent + ", " + item.english :
                                        item.english;
                                    contentInput.value = newContent;
                                    contentInput.focus();
                                };
                                
                                lexiconList.appendChild(tagItem);
                            });
                        };
                        
                        searchInput.oninput = (e) => {
                            renderLexicon(e.target.value);
                        };
                        
                        lexiconSection.appendChild(lexiconHeader);
                        lexiconSection.appendChild(lexiconList);
                        
                        // Add new lexicon entry section
                        const newEntrySection = createEl("div", "", "");
                        newEntrySection.style.cssText = `
                            padding: 8px;
                            border-top: 1px solid #444;
                            display: flex;
                            gap: 4px;
                            align-items: center;
                        `;
                        
                        const newEnglishInput = createEl("input", "", "");
                        newEnglishInput.type = "text";
                        newEnglishInput.placeholder = "English";
                        newEnglishInput.style.cssText = `
                            flex: 1;
                            padding: 4px 6px;
                            background: #2a2a2a;
                            border: 1px solid #555;
                            border-radius: 2px;
                            color: #ccc;
                            font-size: 10px;
                        `;
                        
                        const newChineseInput = createEl("input", "", "");
                        newChineseInput.type = "text";
                        newChineseInput.placeholder = "中文";
                        newChineseInput.style.cssText = `
                            flex: 1;
                            padding: 4px 6px;
                            background: #2a2a2a;
                            border: 1px solid #555;
                            border-radius: 2px;
                            color: #ccc;
                            font-size: 10px;
                        `;
                        
                        const addEntryBtn = createEl("button", "", "+");
                        addEntryBtn.style.cssText = `
                            padding: 4px 8px;
                            background: #444;
                            color: #ccc;
                            border: 1px solid #666;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 10px;
                        `;
                        
                        addEntryBtn.onclick = () => {
                            const english = newEnglishInput.value.trim();
                            const chinese = newChineseInput.value.trim();
                            
                            if (english && chinese) {
                                const existingIndex = this.promptse_data.lexicon.findIndex(
                                    item => item.english.toLowerCase() === english.toLowerCase()
                                );
                                
                                if (existingIndex === -1) {
                                    this.promptse_data.lexicon.push({
                                        id: "lex_" + Date.now(),
                                        english: english,
                                        chinese: chinese,
                                        category: "custom",
                                        tags: [english.toLowerCase(), chinese.toLowerCase()]
                                    });
                                    
                                    newEnglishInput.value = "";
                                    newChineseInput.value = "";
                                    renderLexicon(searchInput.value);
                                    this.triggerSlotChanged();
                                } else {
                                    alert("This entry already exists!");
                                }
                            }
                        };
                        
                        newEntrySection.appendChild(newEnglishInput);
                        newEntrySection.appendChild(newChineseInput);
                        newEntrySection.appendChild(addEntryBtn);
                        
                        lexiconSection.appendChild(newEntrySection);
                        
                        // Initial render of lexicon
                        renderLexicon();
                        
                        // Buttons
                        const buttonContainer = createEl("div", "", "");
                        buttonContainer.style.cssText = `
                            display: flex;
                            gap: 8px;
                            justify-content: flex-end;
                        `;
                        
                        const saveBtn = createEl("button", "", "Save");
                        saveBtn.style.cssText = `
                            padding: 8px 16px;
                            background: #444;
                            color: #ccc;
                            border: 1px solid #666;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 12px;
                        `;
                        
                        const cancelBtn = createEl("button", "", "Cancel");
                        cancelBtn.style.cssText = `
                            padding: 8px 16px;
                            background: #333;
                            color: #aaa;
                            border: 1px solid #555;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 12px;
                        `;
                        
                        buttonContainer.appendChild(cancelBtn);
                        buttonContainer.appendChild(saveBtn);
                        
                        modalContent.appendChild(header);
                        modalContent.appendChild(titleLabel);
                        modalContent.appendChild(titleInput);
                        modalContent.appendChild(contentLabel);
                        modalContent.appendChild(contentInput);
                        modalContent.appendChild(weightLabel);
                        modalContent.appendChild(weightInput);
                        modalContent.appendChild(lexiconSection);
                        modalContent.appendChild(buttonContainer);
                        
                        modal.appendChild(modalContent);
                        document.body.appendChild(modal);
                        
                        // Make modal draggable
                        let isDragging = false;
                        let dragOffset = { x: 0, y: 0 };
                        
                        header.onmousedown = (e) => {
                            isDragging = true;
                            dragOffset.x = e.clientX - modalContent.offsetLeft;
                            dragOffset.y = e.clientY - modalContent.offsetTop;
                            e.preventDefault();
                        };
                        
                        document.onmousemove = (e) => {
                            if (isDragging) {
                                modalContent.style.left = (e.clientX - dragOffset.x) + 'px';
                                modalContent.style.top = (e.clientY - dragOffset.y) + 'px';
                                modalContent.style.position = 'absolute';
                            }
                        };
                        
                        document.onmouseup = () => {
                            isDragging = false;
                        };
                        
                        // Event handlers
                        const closeModal = () => {
                            document.body.removeChild(modal);
                        };
                        
                        closeBtn.onclick = closeModal;
                        cancelBtn.onclick = closeModal;
                        
                        modal.onclick = (e) => {
                            if (e.target === modal) {
                                closeModal();
                            }
                        };
                        
                        saveBtn.onclick = () => {
                            this.promptse_data.entries[index].title = titleInput.value;
                            this.promptse_data.entries[index].content = contentInput.value;
                            this.promptse_data.entries[index].weight = parseFloat(weightInput.value);
                            this.renderPromptseEntries();
                            this.triggerSlotChanged();
                            closeModal();
                        };
                        
                        // Focus on title input
                        titleInput.focus();
                    };
                    
                    // Function to import lexicon
                    this.importLexicon = () => {
                        const input = createEl("input", "", "");
                        input.type = "file";
                        input.accept = ".txt,.csv";
                        input.style.display = "none";
                        
                        input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                try {
                                    this.parseLexiconFile(event.target.result);
                                } catch (error) {
                                    console.error("PromptSE: Error parsing lexicon file:", error);
                                    alert("Error parsing lexicon file. Please check the format.");
                                }
                            };
                            reader.readAsText(file, 'UTF-8');
                        };
                        
                        document.body.appendChild(input);
                        input.click();
                        document.body.removeChild(input);
                    };
                    
                    // Function to parse lexicon file
                    this.parseLexiconFile = (content) => {
                        const lines = content.split('\n');
                        let imported = 0;
                        
                        lines.forEach((line, index) => {
                            line = line.trim();
                            if (!line || line.startsWith('#')) return;
                            
                            const parts = line.split(',');
                            if (parts.length >= 2) {
                                const english = parts[0].trim();
                                const chinese = parts[1].trim();
                                
                                if (english && chinese) {
                                    const existingIndex = this.promptse_data.lexicon.findIndex(
                                        item => item.english.toLowerCase() === english.toLowerCase()
                                    );
                                    
                                    if (existingIndex === -1) {
                                        this.promptse_data.lexicon.push({
                                            id: "lex_" + Date.now() + "_" + imported,
                                            english: english,
                                            chinese: chinese,
                                            category: "imported",
                                            tags: [english.toLowerCase(), chinese.toLowerCase()]
                                        });
                                        imported++;
                                    }
                                }
                            }
                        });
                        
                        console.log(`PromptSE: Imported ${imported} lexicon entries`);
                        this.triggerSlotChanged();
                        alert(`Successfully imported ${imported} lexicon entries!`);
                    };
                    
                    // Function to search lexicon
                    this.searchLexicon = (query) => {
                        if (!query || query.length < 1) {
                            return this.promptse_data.lexicon;
                        }
                        
                        const lowerQuery = query.toLowerCase();
                        return this.promptse_data.lexicon.filter(item =>
                            item.english.toLowerCase().includes(lowerQuery) ||
                            item.chinese.toLowerCase().includes(lowerQuery) ||
                            item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
                        );
                    };
                    
                    // Function to move entry from one index to another
                    this.moveEntry = (fromIndex, toIndex) => {
                        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
                            fromIndex >= this.promptse_data.entries.length ||
                            toIndex >= this.promptse_data.entries.length) {
                            return;
                        }
                        
                        const entries = this.promptse_data.entries;
                        const movedEntry = entries.splice(fromIndex, 1)[0];
                        entries.splice(toIndex, 0, movedEntry);
                        
                        console.log('PromptSE: Moved entry from', fromIndex, 'to', toIndex);
                        this.renderPromptseEntries();
                        this.triggerSlotChanged();
                    };
                    
                    // Function to open settings panel
                    this.openSettingsPanel = () => {
                        // Check if settings modal already exists
                        if (document.getElementById('promptse-settings-modal')) {
                            return;
                        }
                        
                        const modal = createEl("div", "", "");
                        modal.id = 'promptse-settings-modal';
                        modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            background: rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 10000;
                        `;
                        
                        const modalContent = createEl("div", "", "");
                        modalContent.style.cssText = `
                            background: #2b2b2b;
                            border: 1px solid #555;
                            border-radius: 4px;
                            width: 450px;
                            min-height: 350px;
                            padding: 16px;
                            position: relative;
                        `;
                        
                        const header = createEl("div", "", "");
                        header.style.cssText = `
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 16px;
                            padding-bottom: 8px;
                            border-bottom: 1px solid #444;
                        `;
                        
                        const title = createEl("span", "", "Settings");
                        title.style.cssText = `
                            color: #ccc;
                            font-weight: 500;
                            font-size: 14px;
                        `;
                        
                        const closeBtn = createEl("button", "", "×");
                        closeBtn.style.cssText = `
                            background: none;
                            border: none;
                            color: #ccc;
                            font-size: 20px;
                            cursor: pointer;
                            padding: 0;
                            width: 24px;
                            height: 24px;
                        `;
                        
                        header.appendChild(title);
                        header.appendChild(closeBtn);
                        
                        // Connector setting
                        const connectorSection = createEl("div", "", "");
                        connectorSection.style.cssText = `margin-bottom: 16px;`;
                        
                        const connectorLabel = createEl("label", "", "Connector:");
                        connectorLabel.style.cssText = `
                            display: block;
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 6px;
                        `;
                        
                        const connectorOptions = createEl("div", "", "");
                        connectorOptions.style.cssText = `
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;
                        `;
                        
                        const connectorChoices = [
                            { value: ", ", label: "Comma" },
                            { value: "\\n", label: "New Line" },
                            { value: " | ", label: "Pipe" },
                            { value: " ", label: "Space" }
                        ];
                        
                        connectorChoices.forEach(choice => {
                            const radio = createEl("input", "", "");
                            radio.type = "radio";
                            radio.name = "connector";
                            radio.value = choice.value;
                            radio.checked = this.promptse_data.settings.connector === choice.value;
                            radio.id = "conn_" + choice.value.replace(/[^a-zA-Z]/g, "");
                            
                            const label = createEl("label", "", choice.label);
                            label.htmlFor = radio.id;
                            label.style.cssText = `
                                color: #ccc;
                                font-size: 11px;
                                margin-left: 4px;
                                margin-right: 12px;
                                cursor: pointer;
                            `;
                            
                            connectorOptions.appendChild(radio);
                            connectorOptions.appendChild(label);
                        });
                        
                        connectorSection.appendChild(connectorLabel);
                        connectorSection.appendChild(connectorOptions);
                        
                        // Weight format setting
                        const weightSection = createEl("div", "", "");
                        weightSection.style.cssText = `margin-bottom: 16px;`;
                        
                        const weightLabel = createEl("label", "", "Weight Format:");
                        weightLabel.style.cssText = `
                            display: block;
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 6px;
                        `;
                        
                        const weightOptions = createEl("div", "", "");
                        weightOptions.style.cssText = `
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;
                        `;
                        
                        const weightChoices = [
                            { value: "parentheses", label: "(text:1.2)" },
                            { value: "brackets", label: "[text:1.2]" },
                            { value: "none", label: "No Format" }
                        ];
                        
                        weightChoices.forEach(choice => {
                            const radio = createEl("input", "", "");
                            radio.type = "radio";
                            radio.name = "weightFormat";
                            radio.value = choice.value;
                            radio.checked = this.promptse_data.settings.weightFormat === choice.value;
                            radio.id = "weight_" + choice.value;
                            
                            const label = createEl("label", "", choice.label);
                            label.htmlFor = radio.id;
                            label.style.cssText = `
                                color: #ccc;
                                font-size: 11px;
                                margin-left: 4px;
                                margin-right: 12px;
                                cursor: pointer;
                            `;
                            
                            weightOptions.appendChild(radio);
                            weightOptions.appendChild(label);
                        });
                        
                        weightSection.appendChild(weightLabel);
                        weightSection.appendChild(weightOptions);
                        
                        // Language setting
                        const languageSection = createEl("div", "", "");
                        languageSection.style.cssText = `margin-bottom: 16px;`;
                        
                        const languageLabel = createEl("label", "", this.getText("language"));
                        languageLabel.style.cssText = `
                            display: block;
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 6px;
                        `;
                        
                        const languageOptions = createEl("div", "", "");
                        languageOptions.style.cssText = `
                            display: flex;
                            gap: 8px;
                        `;
                        
                        const languageChoices = [
                            { value: "zh", label: "中文" },
                            { value: "en", label: "English" }
                        ];
                        
                        languageChoices.forEach(choice => {
                            const radio = createEl("input", "", "");
                            radio.type = "radio";
                            radio.name = "language";
                            radio.value = choice.value;
                            radio.checked = this.language === choice.value;
                            radio.id = "lang_" + choice.value;
                            
                            const label = createEl("label", "", choice.label);
                            label.htmlFor = radio.id;
                            label.style.cssText = `
                                color: #ccc;
                                font-size: 11px;
                                margin-left: 4px;
                                margin-right: 12px;
                                cursor: pointer;
                            `;
                            
                            languageOptions.appendChild(radio);
                            languageOptions.appendChild(label);
                        });
                        
                        languageSection.appendChild(languageLabel);
                        languageSection.appendChild(languageOptions);
                        
                        // Data management section
                        const dataSection = createEl("div", "", "");
                        dataSection.style.cssText = `margin-bottom: 16px;`;
                        
                        const dataLabel = createEl("div", "", this.getText("dataManagement"));
                        dataLabel.style.cssText = `
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 8px;
                        `;
                        
                        const dataButtons = createEl("div", "", "");
                        dataButtons.style.cssText = `
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;
                        `;
                        
                        const exportBtn = createEl("button", "", "Export Config");
                        exportBtn.style.cssText = `
                            padding: 6px 12px;
                            background: #444;
                            color: #ccc;
                            border: 1px solid #666;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 11px;
                        `;
                        exportBtn.onclick = () => {
                            this.exportConfig();
                        };
                        
                        const resetBtn = createEl("button", "", "Reset to Default");
                        resetBtn.style.cssText = `
                            padding: 6px 12px;
                            background: #444;
                            color: #ccc;
                            border: 1px solid #666;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 11px;
                        `;
                        resetBtn.onclick = () => {
                            if (confirm("Reset all settings to default? This cannot be undone.")) {
                                this.resetToDefault();
                                closeModal();
                            }
                        };
                        
                        dataButtons.appendChild(exportBtn);
                        dataButtons.appendChild(resetBtn);
                        dataSection.appendChild(dataLabel);
                        dataSection.appendChild(dataButtons);
                        
                        // Buttons
                        const buttonContainer = createEl("div", "", "");
                        buttonContainer.style.cssText = `
                            display: flex;
                            gap: 8px;
                            justify-content: flex-end;
                            margin-top: 20px;
                        `;
                        
                        const cancelBtn = createEl("button", "", "Cancel");
                        cancelBtn.style.cssText = `
                            padding: 8px 16px;
                            background: #333;
                            color: #aaa;
                            border: 1px solid #555;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 12px;
                        `;
                        
                        const saveBtn = createEl("button", "", "Save");
                        saveBtn.style.cssText = `
                            padding: 8px 16px;
                            background: #444;
                            color: #ccc;
                            border: 1px solid #666;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 12px;
                        `;
                        
                        buttonContainer.appendChild(cancelBtn);
                        buttonContainer.appendChild(saveBtn);
                        
                        modalContent.appendChild(header);
                        modalContent.appendChild(connectorSection);
                        modalContent.appendChild(weightSection);
                        modalContent.appendChild(languageSection);
                        modalContent.appendChild(dataSection);
                        modalContent.appendChild(buttonContainer);
                        
                        modal.appendChild(modalContent);
                        document.body.appendChild(modal);
                        
                        // Event handlers
                        const closeModal = () => {
                            document.body.removeChild(modal);
                        };
                        
                        closeBtn.onclick = closeModal;
                        cancelBtn.onclick = closeModal;
                        
                        modal.onclick = (e) => {
                            if (e.target === modal) {
                                closeModal();
                            }
                        };
                        
                        saveBtn.onclick = () => {
                            let languageChanged = false;
                            
                            // Save language setting
                            const selectedLanguage = document.querySelector('input[name="language"]:checked');
                            if (selectedLanguage && selectedLanguage.value !== this.language) {
                                this.language = selectedLanguage.value;
                                languageChanged = true;
                            }
                            
                            // Save connector setting
                            const selectedConnector = document.querySelector('input[name="connector"]:checked');
                            if (selectedConnector) {
                                let connectorValue = selectedConnector.value;
                                if (connectorValue === "\\n") connectorValue = "\n";
                                this.promptse_data.settings.connector = connectorValue;
                            }
                            
                            // Save weight format setting
                            const selectedWeight = document.querySelector('input[name="weightFormat"]:checked');
                            if (selectedWeight) {
                                this.promptse_data.settings.weightFormat = selectedWeight.value;
                            }
                            
                            this.renderPromptseEntries();
                            this.triggerSlotChanged();
                            closeModal();
                            
                            // If language changed, refresh the entire UI
                            if (languageChanged) {
                                this.refreshUILanguage();
                            }
                        };
                    };
                    
                    // Function to export config
                    this.exportConfig = () => {
                        const config = {
                            settings: this.promptse_data.settings,
                            lexicon: this.promptse_data.lexicon
                        };
                        
                        const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
                        const url = URL.createObjectURL(blob);
                        const a = createEl("a", "", "");
                        a.href = url;
                        a.download = 'promptse-config.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    };
                    
                    // Function to reset to default
                    this.resetToDefault = () => {
                        this.promptse_data.settings = {
                            connector: ", ",
                            mode: "M",
                            weightFormat: "parentheses"
                        };
                        this.promptse_data.lexicon = [];
                        this.renderPromptseEntries();
                        this.triggerSlotChanged();
                    };
                    
                    // Function to refresh UI language
                    this.refreshUILanguage = () => {
                        // Update header title
                        const headerTitle = document.querySelector('.promptse-container .promptse-header span');
                        if (headerTitle) {
                            headerTitle.textContent = this.getText("title");
                        }
                        
                        // Update toolbar button titles
                        const importBtn = document.querySelector('.promptse-container button[title]');
                        if (importBtn && importBtn.textContent === '📁') {
                            importBtn.title = this.getText("import");
                        }
                        
                        const settingsBtn = document.querySelector('.promptse-container button[title="Settings"], .promptse-container button[title="设置"]');
                        if (settingsBtn && settingsBtn.textContent === '⚙️') {
                            settingsBtn.title = this.getText("settings");
                        }
                        
                        // Update control buttons text
                        const addBtn = document.querySelector('.promptse-container .promptse-controls button');
                        if (addBtn) {
                            addBtn.textContent = "+ " + this.getText("add");
                        }
                        
                        const removeBtn = document.querySelector('.promptse-container .promptse-controls button:nth-child(2)');
                        if (removeBtn) {
                            removeBtn.textContent = this.getText("remove");
                        }
                        
                        const modeBtn = document.querySelector('.promptse-container .promptse-controls button:last-child');
                        if (modeBtn) {
                            const currentMode = this.promptse_data.settings.mode;
                            modeBtn.textContent = this.getText("mode") + ": " + currentMode;
                        }
                        
                        // Update output preview label
                        const outputLabel = document.querySelector('.promptse-output div:first-child');
                        if (outputLabel) {
                            outputLabel.textContent = this.getText("output");
                        }
                        
                        console.log("PromptSE: UI language refreshed to", this.language);
                    };
                    
                    // Function to edit entry
                    this.editPromptseEntry = (index) => {
                        console.log("PromptSE: Editing entry", index);
                        const entry = this.promptse_data.entries[index];
                        this.createModalEditor(entry, index);
                    };
                    
                    // Create output preview
                    const outputSection = createEl("div", "promptse-output");
                    outputSection.style.cssText = `
                        margin-bottom: 12px;
                        padding: 8px;
                        background: #2a2a2a;
                        border: 1px solid #444;
                        border-radius: 2px;
                    `;
                    
                    const outputLabel = createEl("div", "", this.getText("output"));
                    outputLabel.style.cssText = `
                        font-size: 10px;
                        color: #999;
                        margin-bottom: 4px;
                        font-weight: 400;
                    `;
                    
                    this.outputPreview = createEl("div", "", "");
                    this.outputPreview.style.cssText = `
                        font-size: 11px;
                        color: #ccc;
                        line-height: 1.3;
                        word-wrap: break-word;
                        min-height: 16px;
                    `;
                    
                    outputSection.appendChild(outputLabel);
                    outputSection.appendChild(this.outputPreview);
                    
                    // Create controls with modern styling
                    const controls = createEl("div", "promptse-controls");
                    controls.style.cssText = `
                        display: flex;
                        gap: 8px;
                        align-items: center;
                        justify-content: space-between;
                    `;
                    
                    const leftControls = createEl("div");
                    leftControls.style.cssText = `
                        display: flex;
                        gap: 8px;
                        align-items: center;
                    `;
                    
                    const rightControls = createEl("div");
                    rightControls.style.cssText = `
                        display: flex;
                        gap: 8px;
                        align-items: center;
                    `;
                    
                    // Add button
                    const addBtn = createEl("button", "", "+ " + this.getText("add"));
                    addBtn.style.cssText = `
                        padding: 6px 10px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 400;
                    `;
                    addBtn.onmouseenter = () => {
                        addBtn.style.background = '#555';
                    };
                    addBtn.onmouseleave = () => {
                        addBtn.style.background = '#444';
                    };
                    addBtn.onclick = () => {
                        console.log("PromptSE: Adding new entry");
                        this.promptse_data.entries.push({
                            id: "entry" + Date.now(),
                            title: "New Prompt",
                            content: "",
                            enabled: true,
                            weight: 1.0
                        });
                        this.renderPromptseEntries();
                        this.triggerSlotChanged();
                    };
                    
                    // Remove button
                    const removeBtn = createEl("button", "", this.getText("remove"));
                    removeBtn.style.cssText = `
                        padding: 6px 10px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 400;
                    `;
                    removeBtn.onmouseenter = () => {
                        removeBtn.style.background = '#555';
                    };
                    removeBtn.onmouseleave = () => {
                        removeBtn.style.background = '#444';
                    };
                    removeBtn.onclick = () => {
                        console.log("PromptSE: Remove button clicked, current entries:", this.promptse_data.entries.length);
                        if (this.promptse_data.entries.length > 1) {
                            this.promptse_data.entries.pop();
                            console.log("PromptSE: Entry removed, remaining:", this.promptse_data.entries.length);
                            this.renderPromptseEntries();
                            this.triggerSlotChanged();
                        }
                    };
                    
                    // Mode toggle
                    const modeBtn = createEl("button", "", this.getText("mode") + ": " + this.promptse_data.settings.mode);
                    modeBtn.style.cssText = `
                        padding: 6px 10px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 11px;
                        font-weight: 400;
                    `;
                    modeBtn.onmouseenter = () => {
                        modeBtn.style.background = '#555';
                    };
                    modeBtn.onmouseleave = () => {
                        modeBtn.style.background = '#444';
                    };
                    modeBtn.onclick = () => {
                        console.log("PromptSE: Mode button clicked, current mode:", this.promptse_data.settings.mode);
                        const newMode = this.promptse_data.settings.mode === "M" ? "S" : "M";
                        this.promptse_data.settings.mode = newMode;
                        modeBtn.textContent = this.getText("mode") + ": " + newMode;
                        
                        // When switching to Single mode, disable all entries
                        if (newMode === "S") {
                            this.promptse_data.entries.forEach(entry => {
                                entry.enabled = false;
                            });
                        }
                        
                        console.log("PromptSE: Mode changed to:", newMode);
                        this.renderPromptseEntries();
                        this.triggerSlotChanged();
                    };
                    
                    leftControls.appendChild(addBtn);
                    leftControls.appendChild(removeBtn);
                    rightControls.appendChild(modeBtn);
                    
                    controls.appendChild(leftControls);
                    controls.appendChild(rightControls);
                    
                    // Assemble the UI
                    container.appendChild(header);
                    container.appendChild(entriesList);
                    container.appendChild(outputSection);
                    container.appendChild(controls);
                    container.appendChild(entriesList);
                    container.appendChild(controls);
                    
                    // Clear any existing widgets with the same name
                    if (this.widgets) {
                        this.widgets = this.widgets.filter(w => w.name !== "promptse_ui");
                    }
                    
                    // Add to node with size constraints
                    this.addDOMWidget("promptse_ui", "div", container, {
                        serialize: false,
                        hideOnZoom: false
                    });
                    
                    // Set minimum node size
                    this.size = [Math.max(this.size[0] || 0, 320), Math.max(this.size[1] || 0, 350)];
                    
                    // Override onResize to maintain minimum size
                    const origOnResize = this.onResize;
                    this.onResize = function(size) {
                        size[0] = Math.max(size[0], 320);
                        size[1] = Math.max(size[1], 350);
                        this.size = size;
                        if (origOnResize) {
                            origOnResize.call(this, size);
                        }
                    };
                    
                    // Add triggerSlotChanged method
                    this.triggerSlotChanged = () => {
                        console.log("PromptSE: Triggering slot changed with data:", this.promptse_data);
                        
                        // Update the hidden widget value
                        const dataWidget = this.widgets?.find(w => w.name === "promptse_data");
                        if (dataWidget) {
                            dataWidget.value = JSON.stringify(this.promptse_data);
                            console.log("PromptSE: Updated widget value:", dataWidget.value);
                        } else {
                            console.warn("PromptSE: Data widget not found!");
                        }
                        
                        this.onResize?.(this.size);
                        if (this.outputs && this.outputs.length > 0) {
                            this.setDirtyCanvas(true, true);
                        }
                    };
                    
                    // Initial render and data sync
                    this.renderPromptseEntries();
                    this.triggerSlotChanged(); // Ensure initial data is synced
                    
                    console.log("PromptSE: UI initialized successfully");
                    console.log("PromptSE: Initial data:", this.promptse_data);
                    console.log("PromptSE: Available widgets:", this.widgets?.map(w => w.name));
                    
                } catch (error) {
                    console.error("PromptSE: Error during initialization:", error);
                }
                
                return r;
            };
            
            // Override serialize to save our data
            const origOnSerialize = nodeType.prototype.onSerialize;
            nodeType.prototype.onSerialize = function(obj) {
                const r = origOnSerialize ? origOnSerialize.apply(this, arguments) : undefined;
                if (this.promptse_data) {
                    obj.promptse_data = this.promptse_data;
                }
                return r;
            };
            
            // Override configure to load our data
            const origOnConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function(obj) {
                const r = origOnConfigure ? origOnConfigure.apply(this, arguments) : undefined;
                console.log("PromptSE: Configure called with:", obj);
                
                if (obj.promptse_data) {
                    this.promptse_data = obj.promptse_data;
                    console.log("PromptSE: Loaded data from serialization:", this.promptse_data);
                    
                    // Update widget if it exists
                    const dataWidget = this.widgets?.find(w => w.name === "promptse_data");
                    if (dataWidget) {
                        dataWidget.value = JSON.stringify(this.promptse_data);
                    }
                    
                    // Only re-render if UI is already initialized
                    if (this.renderPromptseEntries && this.promptse_initialized) {
                        setTimeout(() => {
                            this.renderPromptseEntries();
                        }, 100);
                    }
                }
                return r;
            };
        }
    }
});