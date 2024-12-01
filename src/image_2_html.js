const fs = require('fs');
const path = require('path');

const settings = require('../generator_settings.json')      // generator_settings.jsonの内容を取得
const extensions = settings.image.extensions                // 画像の拡張子リスト
const imageFolder = "./images";                             // 画像を参照するフォルダ
const title = settings.html.title                           // htmlタイトル・ファイル名
const column = settings.html.layout.column                  // 列数
const isBarBottom = settings.html.layout.isBarBottom        // タブバー下表示
const isDarkMode = settings.html.layout.isDarkMode          // ダークモード有効化


if (require.main === module) {
    main()
}

// main処理
function main() {
    try {
        // 画像ファイルを取得
        const imgFolderMap = getImgFiles(imageFolder);

        // HTMLファイルを生成
        const htmlContent = htmlTemplate(imgFolderMap);
        fs.writeFileSync(`./clipboards/${title}.html`, htmlContent);

        console.log('HTMLファイルを生成しました！');
    } catch (e) {
        console.error('エラーが発生しました: ', e);
    }
    
}


// ディレクトリ内を再帰的に探索して画像ファイルを取得する
function getImgFiles(dir, fileList = {}) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const extension = path.extname(file).toLowerCase(); 
        
        if (fs.statSync(filePath).isDirectory()) {
            fileList = getImgFiles(filePath, fileList);
        } else if (extensions.includes(extension)) {
            const dirName = path.relative(imageFolder, dir) || 'root';
            if (!fileList[dirName]) {
                fileList[dirName] = [];
            }
            fileList[dirName].push({
                name: path.basename(file, extension),
                path: filePath
            });
        }
    });

    return fileList;
}

// HTMLテンプレート
function htmlTemplate(imagesByFolder) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        html {
            font-size: 1vw;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: ${isDarkMode ? '#1E1E1E;' : '#ffffff;'}
        }

        .tab {
            display: none;
        }

        .tab.active {
            display: block;
        }

        .side-scroll {
            width: 100%;
            background-color: ${isDarkMode ? '#1E1E1E;' : '#ffffff;'}
            position: fixed;
            ${isBarBottom ? 'bottom: 0;' : 'top: 0;'}
            left: 0;
            z-index: 999;
        }

        .tabs {
            display: flex;
            gap: 10px;
            justify-content: flex-start;
            overflow-x: scroll;
            white-space: nowrap;
            -ms-overflow-style: none;
            scrollbar-width: none;
            padding: 20px 10px;
        }

        .tabs::-webkit-scrollbar{
            display: none;
        }

        .tab-button {
            cursor: pointer;
            background: #007BFF;
            color: white;
            font-size: min(1.8rem, 20px);
            padding: 10px;
            border-radius: 4px;
            border: none;
        }

        .spacer {
            margin-left: 20px;
        }

        .tab-button.active {
            background: #0056b3;
        }

        .image-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: flex-start;
            ${isBarBottom ? 'margin-bottom: 90px;' : 'margin-top: 90px;'}
        }

        .image-container img {
            width: 98%;
            height: auto;
            cursor: pointer;
            border: 3px solid ${isDarkMode ? '#000000;' : '#ddd;'}
            border-radius: 4px;
            padding: 3px;
            transition: 0.3s;
        }

        .image-container img:hover {
            border-color: ${isDarkMode ? '#dbdbdb;' : '#4e4e4e;'}
            ${isDarkMode ? 'background-color: #dbdbdb;' : 'opacity: 0.7;'}
        }

        .image-container div {
            flex: 1 0 ${100 / column - 1}%;
            max-width: ${100 / column - 1}%;

            box-sizing: border-box;
            text-align: center;
        }

        .image-container p {
            color: ${isDarkMode ? '#dbdbdb;' : '#000000;'}
            font-size: 1.6rem;
        }
    </style>
</head>
<body>
    <div class="side-scroll">
        <div class="tabs">
            ${Object.keys(imagesByFolder).map((folder, index) => `
                <button class="tab-button ${index === 0 ? 'active' : ''}" onclick="showTab(${index})">${folder}</button>
            `).join('')}
        </div>
    </div>
    ${Object.keys(imagesByFolder).map((folder, index) => `
        <div id="tab${index}" class="tab ${index === 0 ? 'active' : ''}">
            <div class="image-container">
                ${imagesByFolder[folder].map(image => `
                    <div>
                        <img src="../${image.path}" alt="${image.name}" onclick="copyToClipboard('${image.name}')">
                        <p>${image.name}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                // alert('Copied to clipboard: ' + text);
            });
        }

        function showTab(tabIndex) {
            const tabs = document.querySelectorAll('.tab');
            const buttons = document.querySelectorAll('.tab-button');

            tabs.forEach(tab => tab.classList.remove('active'));
            buttons.forEach(button => button.classList.remove('active'));

            tabs[tabIndex].classList.add('active');
            buttons[tabIndex].classList.add('active');
        }

        const scrollContainer = document.querySelector('.tabs');

        scrollContainer.addEventListener('wheel', (event) => {
            event.preventDefault();
            
            // スクロール速度の倍率を設定（数値を大きくすると速くなる）
            const speedMultiplier = 5; // この数値を調整
            
            scrollContainer.scrollBy({
                left: event.deltaY * speedMultiplier,
                behavior: 'smooth'
            });
        });
    </script>
</body>
</html>
`
}
