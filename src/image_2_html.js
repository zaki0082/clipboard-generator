const fs = require('fs');
const path = require('path');

// generator_settings.jsonの内容を取得
const settings = require('../generator_settings.json')
// 画像の拡張子
const extensions = settings.image.extensions
// 画像を参照するフォルダ
const imageFolder = settings.image.folder

if (require.main === module) {
    main()
}

// main処理
function main() {
    try {
        // 画像ファイルを取得
        const dir = settings.image.folder
        const images = getImgFiles(dir);
        console.log(images)


        // // HTMLファイルを生成
        // const htmlContent = htmlTemplate(imagesByFolder);
        // fs.writeFileSync('stand.html', htmlContent);

        console.log('HTML file has been generated!');
    } catch (e) {
        console.error('エラーが発生しました:', e.message);
    }
    
}


// ディレクトリ内を再帰的に探索してPNGファイルを取得する関数
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
    <title>STAND</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 10px;
        }
        .tab {
            display: none;
        }
        .tab.active {
            display: block;
        }
        .tabs {
            padding: 20px 0;
            width: 100%;
            background-color: #fff;
            position: fixed;
            top: 0;
        }
        .tab-button {
            cursor: pointer;
            background: #007BFF;
            color: white;
            font-size: 20px;
            padding: 10px;
            margin-right: 10px;
            border-radius: 4px;
            border: none;
        }
        .tab-button-2 {
            cursor: pointer;
            background: #fa5021;
            color: white;
            font-size: 20px;
            padding: 10px;
            margin-right: 10px;
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
            margin-top: 80px;
        }
        .image-container img {
            width: 98%;
            height: auto;
            cursor: pointer;
            border: 2px solid #ddd;
            border-radius: 4px;
            padding: 3px;
            transition: 0.3s;
        }
        .image-container img:hover {
            border-color: #666;
        }
        .image-container div {
            /* 4つごとに改行 */
            flex: 1 0 24%; 
            max-width: 24%;
            /* 5つごとに改行 */
            /* flex: 1 0 19%; 
            max-width: 19%; */

            box-sizing: border-box;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="tabs">
        ${Object.keys(imagesByFolder).map((folder, index) => `
            <button class="tab-button ${index === 0 ? 'active' : ''}" onclick="showTab(${index})">${folder}</button>
        `).join('')}
    </div>
    <button class="tab-button-2 spacer" onclick="copyToClipboard('DS( -1 );\nZSS( CENTER, , MOVE_STOP, NORMAL );\n')">1人</button>
    <button class="tab-button-2" onclick="copyToClipboard('DS( -1 );\nZSS( LEFT, , MOVE_STOP, NORMAL );\nZSS( RIGHT, , MOVE_STOP, NORMAL );\n')">2人</button>
    <button class="tab-button-2" onclick="copyToClipboard('DS( -1 );\nZSS( LEFTLEFT, , MOVE_STOP, NORMAL );\nZSS( CENTER, , MOVE_STOP, NORMAL );\nZSS( RIGHTRIGHT, , MOVE_STOP, NORMAL );\n')">3人</button>
    ${Object.keys(imagesByFolder).map((folder, index) => `
        <div id="tab${index}" class="tab ${index === 0 ? 'active' : ''}">
            <div class="image-container">
                ${imagesByFolder[folder].map(image => `
                    <div>
                        <img src="${image.path}" alt="${image.name}" onclick="copyToClipboard('${image.name}')">
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
    </script>
</body>
</html>
`
}
