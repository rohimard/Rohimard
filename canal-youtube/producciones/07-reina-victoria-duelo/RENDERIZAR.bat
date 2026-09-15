@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Montar video-07-reina-victoria.mp4

echo ============================================================
echo  MONTAJE LOCAL - 07-reina-victoria-duelo
echo ============================================================
echo.

if not exist "imagenes" (
  echo  No encuentro la carpeta "imagenes" al lado de este archivo.
  echo  Descomprime ahi las 89 imagenes y vuelve a ejecutar.
  echo.
  pause
  exit /b 1
)

rem --- renombrado ---------------------------------------------------------
rem Si no estan como 01.jpg..89.jpg, se renombran por fecha de creacion,
rem que es el orden en que las fue generando el modelo. Se ensena la lista
rem antes de tocar nada para poder abortar.
if not exist "imagenes\01.jpg" (
  echo  Las imagenes no estan numeradas. Las voy a renombrar por fecha de
  echo  creacion, que es el orden en que se generaron:
  echo.
  set /a i=0
  for /f "delims=" %%F in ('dir /b /o:d /t:c "imagenes\*.jpg" "imagenes\*.png" 2^>nul') do (
    set /a i+=1
    set "nn=0!i!"
    set "nn=!nn:~-2!"
    echo    %%F  --^>  !nn!.jpg
  )
  echo.
  echo  Si ese orden NO es el correcto, cierra esta ventana y renombralas a
  echo  mano como 01.jpg, 02.jpg ... 89.jpg
  echo.
  pause
  set /a i=0
  for /f "delims=" %%F in ('dir /b /o:d /t:c "imagenes\*.jpg" "imagenes\*.png" 2^>nul') do (
    set /a i+=1
    set "nn=0!i!"
    set "nn=!nn:~-2!"
    ren "imagenes\%%F" "!nn!.jpg" 2>nul
  )
)

rem --- piezas que faltan --------------------------------------------------
for %%A in (audio.mp3 subtitulos.srt filtro.txt) do (
  if not exist "%%A" (
    echo  Bajando %%A ...
    curl -sSL -o "%%A" "https://raw.githubusercontent.com/rohimard/Rohimard/claude/viral-youtube-video-ideas-luqj2m/canal-youtube/producciones/07-reina-victoria-duelo/%%A"
  )
)

rem --- ffmpeg -------------------------------------------------------------
rem Se guarda al lado, sin instalar nada en el sistema ni tocar el PATH.
if not exist "ffmpeg.exe" (
  echo  Bajando ffmpeg ^(unos 80 MB, solo la primera vez^) ...
  curl -L -o ffmpeg.zip "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
  echo  Descomprimiendo ...
  tar -xf ffmpeg.zip
  for /d %%D in (ffmpeg-master-*) do copy /y "%%D\bin\ffmpeg.exe" "ffmpeg.exe" >nul
  for /d %%D in (ffmpeg-master-*) do rmdir /s /q "%%D"
  del ffmpeg.zip
)
if not exist "ffmpeg.exe" (
  echo  No he podido preparar ffmpeg. Revisa tu conexion y reintenta.
  pause
  exit /b 1
)

rem --- montaje ------------------------------------------------------------
echo.
echo  Montando 89 planos - 270 segundos - 1920x1080 @ 25fps
echo  Tarda entre 5 y 15 minutos segun el PC. No cierres la ventana.
echo.

ffmpeg.exe -y ^
  -loop 1 -t 3 -i "imagenes/01.jpg" ^
  -loop 1 -t 3 -i "imagenes/02.jpg" ^
  -loop 1 -t 3 -i "imagenes/03.jpg" ^
  -loop 1 -t 2 -i "imagenes/04.jpg" ^
  -loop 1 -t 3 -i "imagenes/05.jpg" ^
  -loop 1 -t 2 -i "imagenes/06.jpg" ^
  -loop 1 -t 3 -i "imagenes/07.jpg" ^
  -loop 1 -t 3 -i "imagenes/08.jpg" ^
  -loop 1 -t 3 -i "imagenes/09.jpg" ^
  -loop 1 -t 3 -i "imagenes/10.jpg" ^
  -loop 1 -t 2 -i "imagenes/11.jpg" ^
  -loop 1 -t 3 -i "imagenes/12.jpg" ^
  -loop 1 -t 2 -i "imagenes/13.jpg" ^
  -loop 1 -t 3 -i "imagenes/14.jpg" ^
  -loop 1 -t 3 -i "imagenes/15.jpg" ^
  -loop 1 -t 3 -i "imagenes/16.jpg" ^
  -loop 1 -t 3 -i "imagenes/17.jpg" ^
  -loop 1 -t 3 -i "imagenes/18.jpg" ^
  -loop 1 -t 3 -i "imagenes/19.jpg" ^
  -loop 1 -t 2 -i "imagenes/20.jpg" ^
  -loop 1 -t 3 -i "imagenes/21.jpg" ^
  -loop 1 -t 2 -i "imagenes/22.jpg" ^
  -loop 1 -t 3 -i "imagenes/23.jpg" ^
  -loop 1 -t 2 -i "imagenes/24.jpg" ^
  -loop 1 -t 3 -i "imagenes/25.jpg" ^
  -loop 1 -t 3 -i "imagenes/26.jpg" ^
  -loop 1 -t 2 -i "imagenes/27.jpg" ^
  -loop 1 -t 2 -i "imagenes/28.jpg" ^
  -loop 1 -t 3 -i "imagenes/29.jpg" ^
  -loop 1 -t 3 -i "imagenes/30.jpg" ^
  -loop 1 -t 3 -i "imagenes/31.jpg" ^
  -loop 1 -t 4 -i "imagenes/32.jpg" ^
  -loop 1 -t 4 -i "imagenes/33.jpg" ^
  -loop 1 -t 4 -i "imagenes/34.jpg" ^
  -loop 1 -t 3 -i "imagenes/35.jpg" ^
  -loop 1 -t 3 -i "imagenes/36.jpg" ^
  -loop 1 -t 2 -i "imagenes/37.jpg" ^
  -loop 1 -t 4 -i "imagenes/38.jpg" ^
  -loop 1 -t 3 -i "imagenes/39.jpg" ^
  -loop 1 -t 2 -i "imagenes/40.jpg" ^
  -loop 1 -t 4 -i "imagenes/41.jpg" ^
  -loop 1 -t 4 -i "imagenes/42.jpg" ^
  -loop 1 -t 4 -i "imagenes/43.jpg" ^
  -loop 1 -t 4 -i "imagenes/44.jpg" ^
  -loop 1 -t 2 -i "imagenes/45.jpg" ^
  -loop 1 -t 2 -i "imagenes/46.jpg" ^
  -loop 1 -t 4 -i "imagenes/47.jpg" ^
  -loop 1 -t 4 -i "imagenes/48.jpg" ^
  -loop 1 -t 4 -i "imagenes/49.jpg" ^
  -loop 1 -t 4 -i "imagenes/50.jpg" ^
  -loop 1 -t 3 -i "imagenes/51.jpg" ^
  -loop 1 -t 4 -i "imagenes/52.jpg" ^
  -loop 1 -t 4 -i "imagenes/53.jpg" ^
  -loop 1 -t 4 -i "imagenes/54.jpg" ^
  -loop 1 -t 4 -i "imagenes/55.jpg" ^
  -loop 1 -t 4 -i "imagenes/56.jpg" ^
  -loop 1 -t 3 -i "imagenes/57.jpg" ^
  -loop 1 -t 3 -i "imagenes/58.jpg" ^
  -loop 1 -t 4 -i "imagenes/59.jpg" ^
  -loop 1 -t 2 -i "imagenes/60.jpg" ^
  -loop 1 -t 3 -i "imagenes/61.jpg" ^
  -loop 1 -t 2 -i "imagenes/62.jpg" ^
  -loop 1 -t 2 -i "imagenes/63.jpg" ^
  -loop 1 -t 3 -i "imagenes/64.jpg" ^
  -loop 1 -t 2 -i "imagenes/65.jpg" ^
  -loop 1 -t 3 -i "imagenes/66.jpg" ^
  -loop 1 -t 3 -i "imagenes/67.jpg" ^
  -loop 1 -t 2 -i "imagenes/68.jpg" ^
  -loop 1 -t 3 -i "imagenes/69.jpg" ^
  -loop 1 -t 2 -i "imagenes/70.jpg" ^
  -loop 1 -t 4 -i "imagenes/71.jpg" ^
  -loop 1 -t 3 -i "imagenes/72.jpg" ^
  -loop 1 -t 3 -i "imagenes/73.jpg" ^
  -loop 1 -t 3 -i "imagenes/74.jpg" ^
  -loop 1 -t 4 -i "imagenes/75.jpg" ^
  -loop 1 -t 2 -i "imagenes/76.jpg" ^
  -loop 1 -t 3 -i "imagenes/77.jpg" ^
  -loop 1 -t 4 -i "imagenes/78.jpg" ^
  -loop 1 -t 2 -i "imagenes/79.jpg" ^
  -loop 1 -t 3 -i "imagenes/80.jpg" ^
  -loop 1 -t 4 -i "imagenes/81.jpg" ^
  -loop 1 -t 3 -i "imagenes/82.jpg" ^
  -loop 1 -t 2 -i "imagenes/83.jpg" ^
  -loop 1 -t 3 -i "imagenes/84.jpg" ^
  -loop 1 -t 3 -i "imagenes/85.jpg" ^
  -loop 1 -t 3 -i "imagenes/86.jpg" ^
  -loop 1 -t 4 -i "imagenes/87.jpg" ^
  -loop 1 -t 4 -i "imagenes/88.jpg" ^
  -loop 1 -t 4 -i "imagenes/89.jpg" ^
  -i "audio.mp3" ^
  -filter_complex_script "filtro.txt" ^
  -map "[vsub]" -map 89:a ^
  -t 270 ^
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -r 25 ^
  -c:a aac -b:a 192k -movflags +faststart ^
  "video-07-reina-victoria.mp4"

if errorlevel 1 (
  echo.
  echo  El montaje ha fallado. Copia el error de arriba y mandalo.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo  LISTO: video-07-reina-victoria.mp4
echo ============================================================
for %%F in ("video-07-reina-victoria.mp4") do echo  Tamano: %%~zF bytes
echo.
pause
