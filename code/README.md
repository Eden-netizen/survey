# Image Bench Survey Frontend

This is a static GitHub Pages frontend for showing benchmark images from `../random`.

Repository:

```text
https://github.com/Eden-netizen/survey
```

GitHub Pages URL:

```text
https://Eden-netizen.github.io/survey/code/
```

Your GitHub username for Pages is `Eden-netizen`, taken from the repository URL. The email `2024090912029@std.uestc.edu.cn` is not used in the Pages URL.

## Virtual Environment

The virtual environment is named `survey` and is stored at:

```text
E:\final_bench_result\survey
```

Activate it in PowerShell:

```powershell
.\survey\Scripts\Activate.ps1
```

If PowerShell blocks activation scripts, use the venv Python directly:

```powershell
.\survey\Scripts\python.exe code\config.py
```

This project has no third-party Python dependencies. The virtual environment is only used to run the manifest generator.

## Local Usage

From `E:\final_bench_result`, generate the image manifest:

```powershell
.\survey\Scripts\python.exe code\config.py
```

Then open:

```text
E:\final_bench_result\code\index.html
```

For local HTTP preview:

```powershell
.\survey\Scripts\python.exe -m http.server 8000
```

Visit:

```text
http://localhost:8000/code/
```

## Anonymous Survey Link

Edit this line in `code/config.py`:

```python
SURVEY_URL = "https://example.com/replace-with-your-anonymous-survey"
```

Replace it with your real anonymous questionnaire URL, then regenerate:

```powershell
.\survey\Scripts\python.exe code\config.py
```

## Image Layout

The page reads only from `random`. Each bench is rendered as one section. Each section has 5 rows. Each row is ordered left to right as:

```text
shot, objectclear, omnieraser, omnipaint, flux-t400-alpha, bg
```

Images are sorted by filename and the first 5 are used, so non-continuous IDs such as `00023.png` and `00104.png` are supported.

## Push To GitHub

From `E:\final_bench_result`:

```powershell
git init
git add .
git commit -m "Add image bench survey frontend"
git branch -M main
git remote add origin https://github.com/Eden-netizen/survey.git
git push -u origin main
```

If `origin` already exists:

```powershell
git remote set-url origin https://github.com/Eden-netizen/survey.git
git push -u origin main
```

## Enable GitHub Pages

In the GitHub repository:

1. Open `Settings -> Pages`
2. Under `Build and deployment`, choose `Deploy from a branch`
3. Select branch `main`
4. Select folder `/root`
5. Save

After deployment, open:

```text
https://Eden-netizen.github.io/survey/code/
```
