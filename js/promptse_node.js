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
                    
                    // Initialize node data only if it doesn't exist (preserve saved data)
                    if (!this.promptse_data) {
                        this.promptse_data = {
                            entries: [
                                { id: "entry1", title: "角色", content: "beautiful girl, long hair", enabled: true, weight: 1.0 },
                                { id: "entry2", title: "风格", content: "anime style, high quality", enabled: true, weight: 1.2 },
                                { id: "entry3", title: "细节", content: "detailed, masterpiece", enabled: false, weight: 1.0 }
                            ],
                            settings: {
                                connector: ", ",
                                mode: "M",
                                weightFormat: "parentheses",
                                showOutputPreview: false, // Default to hidden
                                language: "zh" // Default language
                            },
                            lexicon: []
                        };
                    } else {
                        // Ensure all settings exist in loaded data
                        if (!this.promptse_data.settings) {
                            this.promptse_data.settings = {};
                        }
                        if (!this.promptse_data.settings.hasOwnProperty('connector')) {
                            this.promptse_data.settings.connector = ", ";
                        }
                        if (!this.promptse_data.settings.hasOwnProperty('mode')) {
                            this.promptse_data.settings.mode = "M";
                        }
                        if (!this.promptse_data.settings.hasOwnProperty('weightFormat')) {
                            this.promptse_data.settings.weightFormat = "parentheses";
                        }
                        if (!this.promptse_data.settings.hasOwnProperty('showOutputPreview')) {
                            this.promptse_data.settings.showOutputPreview = false;
                        }
                        if (!this.promptse_data.settings.hasOwnProperty('language')) {
                            this.promptse_data.settings.language = "zh";
                        }
                        if (!this.promptse_data.lexicon) {
                            this.promptse_data.lexicon = [];
                        }
                    }
                    
                    // Language system with complete Chinese localization
                    // Always use the saved language setting
                    this.language = this.promptse_data.settings.language || "zh";
                    this.texts = {
                        zh: {
                            // 基础文本
                            title: "提示词编辑器",
                            
                            // 模式相关 - 更直观的描述
                            multiMode: "多选模式",
                            singleMode: "单选模式",
                            modeTooltip: "多选：组合多个条目 | 单选：仅使用一个条目",
                            
                            // 按钮和操作
                            import: "导入词库",
                            settings: "设置",
                            add: "添加",
                            remove: "删除",
                            save: "保存",
                            cancel: "取消",
                            apply: "应用",
                            
                            // 设置面板
                            settingsTitle: "设置面板",
                            connector: "连接符",
                            comma: "逗号 (,)",
                            newLine: "换行符",
                            pipe: "管道符 (|)",
                            space: "空格",
                            customConnector: "自定义连接符",
                            
                            // 权重格式
                            weightFormat: "权重格式",
                            parentheses: "圆括号 (text:1.2)",
                            brackets: "方括号 [text:1.2]",
                            noFormat: "不使用权重",
                            
                            // 显示选项
                            displayOptions: "显示选项",
                            showOutputPreview: "显示输出预览",
                            
                            // 数据管理
                            dataManagement: "数据管理",
                            exportConfig: "导出配置",
                            importConfig: "导入配置",
                            resetDefault: "重置为默认",
                            resetConfirm: "确定要重置所有设置吗？此操作不可撤销。",
                            
                            // 语言设置
                            language: "界面语言",
                            chinese: "简体中文",
                            english: "English",
                            
                            // 条目编辑
                            editEntry: "编辑条目",
                            title_label: "标题：",
                            content_label: "内容：",
                            weight_label: "权重：",
                            dragToReorder: "拖动排序",
                            
                            // 词库
                            lexicon: "词库",
                            searchTags: "搜索标签...",
                            addTag: "添加标签",
                            noLexicon: "暂无词库",
                            noResults: "未找到匹配项",
                            
                            // 输出预览
                            output: "输出预览：",
                            
                            // 成功/错误消息
                            importSuccess: "成功导入 {count} 个词库条目！",
                            entryExists: "此条目已存在！",
                            parseError: "解析词库文件出错，请检查格式。"
                        },
                        en: {
                            // Basic text
                            title: "PromptSE",
                            
                            // Mode related
                            multiMode: "Multi Mode",
                            singleMode: "Single Mode",
                            modeTooltip: "Multi: Combine multiple entries | Single: Use only one entry",
                            
                            // Buttons and actions
                            import: "Import Lexicon",
                            settings: "Settings",
                            add: "Add",
                            remove: "Remove",
                            save: "Save",
                            cancel: "Cancel",
                            apply: "Apply",
                            
                            // Settings panel
                            settingsTitle: "Settings",
                            connector: "Connector",
                            comma: "Comma (,)",
                            newLine: "New Line",
                            pipe: "Pipe (|)",
                            space: "Space",
                            customConnector: "Custom Connector",
                            
                            // Weight format
                            weightFormat: "Weight Format",
                            parentheses: "Parentheses (text:1.2)",
                            brackets: "Brackets [text:1.2]",
                            noFormat: "No Weight",
                            
                            // Display options
                            displayOptions: "Display Options",
                            showOutputPreview: "Show Output Preview",
                            
                            // Data management
                            dataManagement: "Data Management",
                            exportConfig: "Export Config",
                            importConfig: "Import Config",
                            resetDefault: "Reset to Default",
                            resetConfirm: "Reset all settings to default? This cannot be undone.",
                            
                            // Language settings
                            language: "Language",
                            chinese: "Chinese",
                            english: "English",
                            
                            // Entry editing
                            editEntry: "Edit Entry",
                            title_label: "Title:",
                            content_label: "Content:",
                            weight_label: "Weight:",
                            dragToReorder: "Drag to reorder",
                            
                            // Lexicon
                            lexicon: "Lexicon",
                            searchTags: "Search tags...",
                            addTag: "Add Tag",
                            noLexicon: "No lexicon loaded",
                            noResults: "No matching tags found",
                            
                            // Output preview
                            output: "Output:",
                            
                            // Success/Error messages
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
                        // When widget value changes, update our internal data
                        try {
                            if (value && typeof value === 'string') {
                                const parsedData = JSON.parse(value);
                                if (parsedData && parsedData.settings) {
                                    this.promptse_data = parsedData;
                                    this.language = parsedData.settings.language || 'zh';
                                    console.log("PromptSE: Updated internal data from widget:", this.promptse_data.settings);
                                }
                            }
                        } catch (e) {
                            console.error("PromptSE: Error parsing widget value:", e);
                        }
                    }, {
                        serialize: true
                    });
                    // Hide the widget from UI
                    if (dataWidget) {
                        dataWidget.hidden = true;
                        dataWidget.computeSize = () => [0, 0];
                    }
                    
                    // Create main container - use full width like skbundle, only leave space for the dot
                    const container = createEl("div", "promptse-container");
                    container.style.cssText = `
                        position: absolute;
                        top: -38px;
                        left: 0;
                        right: 5px;
                        bottom: 0;
                        height: calc(100% + 38px);
                        padding: 6px;
                        padding-top: 40px;
                        background: #2b2b2b;
                        border: 1px solid #444;
                        border-radius: 4px;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        color: #ffffff;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        z-index: 1;
                    `;
                    
                    // Create header with flat design
                    const header = createEl("div", "promptse-header");
                    header.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: -32px;
                        margin-bottom: 4px;
                        padding-bottom: 4px;
                        border-bottom: 1px solid #444;
                    `;
                    
                    const title = createEl("span", "promptse-title", this.getText("title"));
                    title.style.cssText = `
                        font-weight: 500;
                        font-size: 12px;
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
                    importBtn.setAttribute('data-action', 'import');
                    importBtn.style.cssText = `
                        padding: 2px 6px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 11px;
                    `;
                    importBtn.onclick = () => {
                        this.importLexicon();
                    };
                    
                    // Settings button
                    const settingsBtn = createEl("button", "", "⚙️");
                    settingsBtn.title = this.getText("settings");
                    settingsBtn.setAttribute('data-action', 'settings');
                    settingsBtn.style.cssText = `
                        padding: 2px 6px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 11px;
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
                        margin-bottom: 6px;
                        flex: 1;
                        min-height: 100px;
                        max-height: calc(100% - 80px);
                        overflow-y: auto;
                        border: 1px solid #444;
                        border-radius: 2px;
                        padding: 4px;
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
                        
                        // Update entries list height based on output preview setting
                        const entriesListEl = document.querySelector('.promptse-entries');
                        if (entriesListEl) {
                            entriesListEl.style.minHeight = this.promptse_data.settings.showOutputPreview ? '100px' : '140px';
                        }
                        
                        this.promptse_data.entries.forEach((entry, index) => {
                            const entryCard = createEl("div", "promptse-entry");
                            entryCard.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                padding: 6px;
                                margin-bottom: 3px;
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
                                margin-bottom: 4px;
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
                            dragHandle.title = this.getText("dragToReorder");
                            
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
                        
                        // Always update output preview (it will be hidden if disabled)
                        this.updateOutputPreview();
                        
                        // Update output section visibility
                        if (this.outputSection) {
                            this.outputSection.style.display = this.promptse_data.settings.showOutputPreview ? 'block' : 'none';
                        }
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
                            this.outputPreview.textContent = outputText || "(empty)";
                        }
                        
                        // Debug log to see what connector is being used
                        console.log("PromptSE: Output generated with connector:", JSON.stringify(connector), "weight format:", this.promptse_data.settings.weightFormat);
                        
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
                        
                        const title = createEl("span", "", this.getText("editEntry"));
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
                        const titleLabel = createEl("label", "", this.getText("title_label"));
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
                        const contentLabel = createEl("label", "", this.getText("content_label"));
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
                        const weightLabel = createEl("label", "", this.getText("weight_label"));
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
                        
                        const lexiconTitle = createEl("span", "", this.getText("lexicon"));
                        lexiconTitle.style.cssText = `
                            color: #aaa;
                            font-size: 12px;
                            flex: 1;
                        `;
                        
                        const searchInput = createEl("input", "", "");
                        searchInput.type = "text";
                        searchInput.placeholder = this.getText("searchTags");
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
                                const noResults = createEl("div", "", query ? this.getText("noResults") : this.getText("noLexicon"));
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
                        
                        // Initial render of lexicon
                        renderLexicon();
                        
                        // Buttons
                        const buttonContainer = createEl("div", "", "");
                        buttonContainer.style.cssText = `
                            display: flex;
                            gap: 8px;
                            justify-content: flex-end;
                        `;
                        
                        const saveBtn = createEl("button", "", this.getText("save"));
                        saveBtn.style.cssText = `
                            padding: 8px 16px;
                            background: #444;
                            color: #ccc;
                            border: 1px solid #666;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 12px;
                        `;
                        
                        const cancelBtn = createEl("button", "", this.getText("cancel"));
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
                                    alert(this.getText("parseError"));
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
                        alert(this.getText("importSuccess", { count: imported }));
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
                    
                    // Function to open settings panel - COMPLETE WITH ALL FIXES
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
                            min-height: 400px;
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
                        
                        const title = createEl("span", "", this.getText("settingsTitle"));
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
                        
                        // Connector setting with FIX for saved state
                        const connectorSection = createEl("div", "", "");
                        connectorSection.style.cssText = `margin-bottom: 16px;`;
                        
                        const connectorLabel = createEl("label", "", this.getText("connector"));
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
                            { value: ", ", label: this.getText("comma") },
                            { value: "\n", label: this.getText("newLine") },
                            { value: " | ", label: this.getText("pipe") },
                            { value: " ", label: this.getText("space") }
                        ];
                        
                        const currentConnector = this.promptse_data.settings.connector;
                        
                        connectorChoices.forEach(choice => {
                            const radio = createEl("input", "", "");
                            radio.type = "radio";
                            radio.name = "connector";
                            radio.value = choice.value;
                            // FIX: Properly check saved state
                            radio.checked = currentConnector === choice.value;
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
                        
                        const weightLabel = createEl("label", "", this.getText("weightFormat"));
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
                            { value: "parentheses", label: this.getText("parentheses") },
                            { value: "brackets", label: this.getText("brackets") },
                            { value: "none", label: this.getText("noFormat") }
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
                        
                        // Display options setting (NEW - for output preview)
                        const displaySection = createEl("div", "", "");
                        displaySection.style.cssText = `margin-bottom: 16px;`;
                        
                        const displayLabel = createEl("label", "", this.getText("displayOptions"));
                        displayLabel.style.cssText = `
                            display: block;
                            color: #aaa;
                            font-size: 12px;
                            margin-bottom: 6px;
                        `;
                        
                        const showPreviewContainer = createEl("div", "", "");
                        showPreviewContainer.style.cssText = `
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        `;
                        
                        const showPreviewCheckbox = createEl("input", "", "");
                        showPreviewCheckbox.type = "checkbox";
                        showPreviewCheckbox.id = "showOutputPreview";
                        showPreviewCheckbox.checked = this.promptse_data.settings.showOutputPreview;
                        
                        const showPreviewLabel = createEl("label", "", this.getText("showOutputPreview"));
                        showPreviewLabel.htmlFor = "showOutputPreview";
                        showPreviewLabel.style.cssText = `
                            color: #ccc;
                            font-size: 11px;
                            cursor: pointer;
                        `;
                        
                        showPreviewContainer.appendChild(showPreviewCheckbox);
                        showPreviewContainer.appendChild(showPreviewLabel);
                        displaySection.appendChild(displayLabel);
                        displaySection.appendChild(showPreviewContainer);
                        
                        // Language setting with FIX for immediate refresh
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
                            { value: "zh", label: this.getText("chinese") },
                            { value: "en", label: this.getText("english") }
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
                        
                        const exportBtn = createEl("button", "", this.getText("exportConfig"));
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
                        
                        const resetBtn = createEl("button", "", this.getText("resetDefault"));
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
                            if (confirm(this.getText("resetConfirm"))) {
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
                        
                        const cancelBtn = createEl("button", "", this.getText("cancel"));
                        cancelBtn.style.cssText = `
                            padding: 8px 16px;
                            background: #333;
                            color: #aaa;
                            border: 1px solid #555;
                            border-radius: 2px;
                            cursor: pointer;
                            font-size: 12px;
                        `;
                        
                        const saveBtn = createEl("button", "", this.getText("save"));
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
                        modalContent.appendChild(displaySection);
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
                        
                        // FIX: Save button with immediate UI refresh
                        saveBtn.onclick = () => {
                            let needsRefresh = false;
                            
                            // Save display preview setting
                            const showPreview = document.getElementById('showOutputPreview').checked;
                            if (showPreview !== this.promptse_data.settings.showOutputPreview) {
                                this.promptse_data.settings.showOutputPreview = showPreview;
                                // Update output section visibility immediately
                                if (this.outputSection) {
                                    this.outputSection.style.display = showPreview ? 'block' : 'none';
                                }
                                // Update node size
                                const minHeight = showPreview ? 280 : 220;
                                this.size[1] = Math.max(this.size[1], minHeight);
                                this.onResize?.(this.size);
                            }
                            
                            // Save language setting
                            const selectedLanguage = document.querySelector('input[name="language"]:checked');
                            if (selectedLanguage && selectedLanguage.value !== this.language) {
                                this.language = selectedLanguage.value;
                                this.promptse_data.settings.language = selectedLanguage.value;
                                needsRefresh = true;
                            }
                            
                            // Save connector setting
                            const selectedConnector = document.querySelector('input[name="connector"]:checked');
                            if (selectedConnector) {
                                this.promptse_data.settings.connector = selectedConnector.value;
                            }
                            
                            // Save weight format setting
                            const selectedWeight = document.querySelector('input[name="weightFormat"]:checked');
                            if (selectedWeight) {
                                this.promptse_data.settings.weightFormat = selectedWeight.value;
                            }
                            
                            // Log the saved settings for debugging
                            console.log("PromptSE: Settings saved:", {
                                connector: this.promptse_data.settings.connector,
                                weightFormat: this.promptse_data.settings.weightFormat,
                                showOutputPreview: this.promptse_data.settings.showOutputPreview,
                                language: this.promptse_data.settings.language
                            });
                            
                            // Always update the output preview after changing settings
                            this.renderPromptseEntries();
                            this.triggerSlotChanged();
                            closeModal();
                            
                            // Refresh UI if needed
                            if (needsRefresh) {
                                this.refreshUI();
                            }
                        };
                    };
                    
                    // Function to refresh entire UI
                    this.refreshUI = () => {
                        // Remove ALL existing containers to prevent duplication
                        const allContainers = document.querySelectorAll('.promptse-container');
                        allContainers.forEach(container => {
                            if (container && container.parentNode) {
                                container.parentNode.removeChild(container);
                            }
                        });
                        
                        // Also check in the node's DOM element
                        if (this.domElement) {
                            const nodeContainers = this.domElement.querySelectorAll('.promptse-container');
                            nodeContainers.forEach(container => {
                                if (container && container.parentNode) {
                                    container.parentNode.removeChild(container);
                                }
                            });
                        }
                        
                        // Reset initialized flag to rebuild UI
                        this.promptse_initialized = false;
                        
                        // Rebuild the entire UI
                        this.onNodeCreated();
                    };
                    
                    // Function to export config
                    this.exportConfig = () => {
                        const config = {
                            settings: this.promptse_data.settings,
                            lexicon: this.promptse_data.lexicon,
                            entries: this.promptse_data.entries
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
                        this.promptse_data = {
                            entries: [
                                { id: "entry1", title: "角色", content: "beautiful girl, long hair", enabled: true, weight: 1.0 },
                                { id: "entry2", title: "风格", content: "anime style, high quality", enabled: true, weight: 1.2 },
                                { id: "entry3", title: "细节", content: "detailed, masterpiece", enabled: false, weight: 1.0 }
                            ],
                            settings: {
                                connector: ", ",
                                mode: "M",
                                weightFormat: "parentheses",
                                showOutputPreview: false,
                                language: "zh"
                            },
                            lexicon: []
                        };
                        this.language = "zh";
                        this.refreshUI();
                        this.triggerSlotChanged();
                    };
                    
                    // Function to edit entry
                    this.editPromptseEntry = (index) => {
                        console.log("PromptSE: Editing entry", index);
                        const entry = this.promptse_data.entries[index];
                        this.createModalEditor(entry, index);
                    };
                    
                    // Create output preview container (will be shown/hidden based on settings)
                    let outputSection = null;
                    this.outputSection = createEl("div", "promptse-output");
                    this.outputSection.style.cssText = `
                        margin-bottom: 4px;
                        padding: 4px;
                        background: #2a2a2a;
                        border: 1px solid #444;
                        border-radius: 2px;
                        display: ${this.promptse_data.settings.showOutputPreview ? 'block' : 'none'};
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
                    
                    this.outputSection.appendChild(outputLabel);
                    this.outputSection.appendChild(this.outputPreview);
                    outputSection = this.outputSection;
                    
                    // Create controls with modern styling
                    const controls = createEl("div", "promptse-controls");
                    controls.style.cssText = `
                        display: flex;
                        gap: 6px;
                        align-items: center;
                        justify-content: space-between;
                        margin-top: auto;
                    `;
                    
                    const leftControls = createEl("div");
                    leftControls.style.cssText = `
                        display: flex;
                        gap: 4px;
                        align-items: center;
                    `;
                    
                    const rightControls = createEl("div");
                    rightControls.style.cssText = `
                        display: flex;
                        gap: 4px;
                        align-items: center;
                    `;
                    
                    // Add button
                    const addBtn = createEl("button", "", "+ " + this.getText("add"));
                    addBtn.setAttribute('data-action', 'add');
                    addBtn.style.cssText = `
                        padding: 4px 8px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 10px;
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
                            title: "新条目",
                            content: "",
                            enabled: true,
                            weight: 1.0
                        });
                        this.renderPromptseEntries();
                        this.triggerSlotChanged();
                    };
                    
                    // Remove button
                    const removeBtn = createEl("button", "", this.getText("remove"));
                    removeBtn.setAttribute('data-action', 'remove');
                    removeBtn.style.cssText = `
                        padding: 4px 8px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 10px;
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
                    
                    // Mode toggle with better text - FIX for intuitive mode display
                    const modeText = this.promptse_data.settings.mode === "M" ?
                        this.getText("multiMode") : this.getText("singleMode");
                    const modeBtn = createEl("button", "mode-button", modeText);
                    modeBtn.title = this.getText("modeTooltip");
                    modeBtn.style.cssText = `
                        padding: 4px 8px;
                        background: #444;
                        color: #ccc;
                        border: 1px solid #666;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 10px;
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
                        modeBtn.textContent = newMode === "M" ?
                            this.getText("multiMode") : this.getText("singleMode");
                        
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
                    container.appendChild(outputSection); // Always add it, control visibility with display property
                    container.appendChild(controls);
                    
                    // Clear any existing widgets with the same name and remove old containers
                    const existingContainers = this.domElement?.querySelectorAll('.promptse-container');
                    if (existingContainers) {
                        existingContainers.forEach(c => {
                            if (c !== container && c.parentNode) {
                                c.parentNode.removeChild(c);
                            }
                        });
                    }
                    
                    if (this.widgets) {
                        this.widgets = this.widgets.filter(w => w.name !== "promptse_ui");
                    }
                    
                    // Add to node with size constraints
                    this.addDOMWidget("promptse_ui", "div", container, {
                        serialize: false,
                        hideOnZoom: false
                    });
                    
                    // Set minimum node size
                    this.size = [Math.max(this.size[0] || 0, 300), Math.max(this.size[1] || 0, 220)];
                    
                    // Override onResize to maintain minimum size
                    const origOnResize = this.onResize;
                    this.onResize = function(size) {
                        size[0] = Math.max(size[0], 300);
                        size[1] = Math.max(size[1], 220);
                        this.size = size;
                        if (origOnResize) {
                            origOnResize.call(this, size);
                        }
                    };
                    
                    // Add triggerSlotChanged method
                    this.triggerSlotChanged = () => {
                        console.log("PromptSE: Triggering slot changed with data:", this.promptse_data);
                        
                        // Update the hidden widget value with current data
                        const dataWidget = this.widgets?.find(w => w.name === "promptse_data");
                        if (dataWidget) {
                            // Ensure we're saving the complete current state
                            const dataToSave = JSON.stringify(this.promptse_data);
                            dataWidget.value = dataToSave;
                            console.log("PromptSE: Updated widget value with settings:", this.promptse_data.settings);
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
                    // Ensure new settings are present
                    if (!this.promptse_data.settings) {
                        this.promptse_data.settings = {};
                    }
                    if (!this.promptse_data.settings.hasOwnProperty('showOutputPreview')) {
                        this.promptse_data.settings.showOutputPreview = false;
                    }
                    if (!this.promptse_data.settings.hasOwnProperty('language')) {
                        this.promptse_data.settings.language = 'zh';
                    }
                    if (!this.promptse_data.settings.hasOwnProperty('connector')) {
                        this.promptse_data.settings.connector = ', ';
                    }
                    if (!this.promptse_data.settings.hasOwnProperty('mode')) {
                        this.promptse_data.settings.mode = 'M';
                    }
                    if (!this.promptse_data.settings.hasOwnProperty('weightFormat')) {
                        this.promptse_data.settings.weightFormat = 'parentheses';
                    }
                    
                    // Always use the saved language
                    this.language = this.promptse_data.settings.language;
                    
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