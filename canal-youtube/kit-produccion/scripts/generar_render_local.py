#!/usr/bin/env python3
"""
generar_render_local.py — emite un render de un solo clic para Windows.

Por qué existe: montar el video en la nube obliga a un viaje de ida y vuelta
(89 imagenes suben, un MP4 de cientos de megas baja). Las imagenes ya estan en
el PC de quien las genero y el MP4 tiene que acabar ahi para subirlo a YouTube,
asi que el camino corto es no mover nada y montar en local.

Produce dos archivos dentro de la carpeta de la produccion:

  filtro.txt      el grafo de filtros de ffmpeg (es la parte enorme, y por eso
                  va aparte: no cabe en una linea de cmd.exe, que corta a 8191
                  caracteres)
  RENDERIZAR.bat  el unico archivo que el usuario descarga. Se baja ffmpeg, el
                  audio, los subtitulos y el filtro desde el repo publico, y
                  lanza el montaje.

El grafo es el mismo que montar_video.js: sobreescalado a 4K antes del Ken
Burns para que el movimiento no vaya a saltos, y subtitulos quemados al final
sobre el montaje ya concatenado para que el zoom no los deforme.

  python3 generar_render_local.py <carpeta de la produccion> <rama>
"""
import json
import pathlib
import sys

RAW = "https://raw.githubusercontent.com/rohimard/Rohimard/{rama}/canal-youtube/producciones/{prod}/{archivo}"
# Build de ffmpeg para Windows con libass dentro, que es lo que quema los
# subtitulos. Sin libass el filtro subtitles no existe y el render muere.
FFMPEG_ZIP = ("https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/"
              "ffmpeg-master-latest-win64-gpl.zip")


def seg(t: str) -> int:
    m, s = str(t).strip().split(":")
    return int(m) * 60 + int(s)


def leer_hoja(ruta: pathlib.Path) -> list:
    lineas = ruta.read_text(encoding="utf-8-sig").strip().splitlines()[1:]
    filas = []
    for l in lineas:
        c = l.split(";")
        if len(c) >= 5:
            filas.append({"n": int(c[0]), "entra": seg(c[2]), "sale": seg(c[3])})
    return filas


def ken_burns(idx: int, dur: float, W: int, H: int, FPS: int, zoom_max: float) -> str:
    frames = max(1, round(dur * FPS))
    paso = (zoom_max - 1) / frames
    dentro = idx % 2 == 0
    z = (f"min(1+{paso:.8f}*on,{zoom_max})" if dentro
         else f"max({zoom_max}-{paso:.8f}*on,1)")
    # Alternar el lado de la deriva evita que los 89 planos se muevan igual.
    lado = 1 if idx % 4 < 2 else -1
    x = f"iw/2-(iw/zoom/2)+{lado}*(iw*0.04)*(on/{frames})"
    y = "ih/2-(ih/zoom/2)"
    return (f"scale={W*2}:-2,zoompan=z='{z}':d=1:x='{x}':y='{y}'"
            f":s={W}x{H}:fps={FPS},setsar=1,format=yuv420p")


def main() -> None:
    prod_dir = pathlib.Path(sys.argv[1]).resolve()
    rama = sys.argv[2]
    cfg = json.loads((prod_dir / "montaje-config.json").read_text())

    FPS = cfg.get("fps", 25)
    W, H = (int(v) for v in cfg.get("resolucion", "1920x1080").split("x"))
    CRF = cfg.get("crf", 20)
    ZOOM = cfg.get("zoom", 1.12)

    filas = leer_hoja(prod_dir / cfg["hoja"])
    fin = filas[-1]["sale"]

    entradas, filtros = [], []
    for i, p in enumerate(filas):
        dur = p["sale"] - p["entra"]
        if dur <= 0:
            continue
        k = len(entradas)
        entradas.append((p["n"], dur))
        filtros.append(f"[{k}:v]{ken_burns(i, dur, W, H, FPS, ZOOM)}[v{k}]")

    nV = len(filtros)
    cadena = ";".join(filtros) + ";"
    cadena += "".join(f"[v{k}]" for k in range(nV)) + f"concat=n={nV}:v=1:a=0[vcat]"
    salida_v = "[vcat]"
    if cfg.get("srt"):
        # DejaVu Sans no existe en Windows; Arial si, en cualquier instalacion.
        estilo = ("FontName=Arial,Fontsize=22,Bold=1,PrimaryColour=&H00FFFFFF,"
                  "OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=1,"
                  "Alignment=2,MarginV=60")
        cadena += f";[vcat]subtitles={cfg['srt']}:force_style='{estilo}'[vsub]"
        salida_v = "[vsub]"

    (prod_dir / "filtro.txt").write_text(cadena, encoding="utf-8")

    # Una imagen por plano, nombrada con su numero. Se piden en el mismo orden
    # que el grafo, porque los indices [0:v]..[88:v] son posicionales.
    ins = " ^\n  ".join(f'-loop 1 -t {d} -i "imagenes/{n:02d}.jpg"'
                        for n, d in entradas)
    idx_audio = len(entradas)
    prod = prod_dir.name
    url = lambda a: RAW.format(rama=rama, prod=prod, archivo=a)

    bat = f"""@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Montar {cfg['salida']}

echo ============================================================
echo  MONTAJE LOCAL - {prod}
echo ============================================================
echo.

if not exist "imagenes" (
  echo  No encuentro la carpeta "imagenes" al lado de este archivo.
  echo  Descomprime ahi las {nV} imagenes y vuelve a ejecutar.
  echo.
  pause
  exit /b 1
)

rem --- renombrado ---------------------------------------------------------
rem Si no estan como 01.jpg..{nV:02d}.jpg, se renombran por fecha de creacion,
rem que es el orden en que las fue generando el modelo. Se ensena la lista
rem antes de tocar nada para poder abortar.
if not exist "imagenes\\01.jpg" (
  echo  Las imagenes no estan numeradas. Las voy a renombrar por fecha de
  echo  creacion, que es el orden en que se generaron:
  echo.
  set /a i=0
  for /f "delims=" %%F in ('dir /b /o:d /t:c "imagenes\\*.jpg" "imagenes\\*.png" 2^>nul') do (
    set /a i+=1
    set "nn=0!i!"
    set "nn=!nn:~-2!"
    echo    %%F  --^>  !nn!.jpg
  )
  echo.
  echo  Si ese orden NO es el correcto, cierra esta ventana y renombralas a
  echo  mano como 01.jpg, 02.jpg ... {nV:02d}.jpg
  echo.
  pause
  set /a i=0
  for /f "delims=" %%F in ('dir /b /o:d /t:c "imagenes\\*.jpg" "imagenes\\*.png" 2^>nul') do (
    set /a i+=1
    set "nn=0!i!"
    set "nn=!nn:~-2!"
    ren "imagenes\\%%F" "!nn!.jpg" 2>nul
  )
)

rem --- piezas que faltan --------------------------------------------------
for %%A in (audio.mp3 {cfg['srt']} filtro.txt) do (
  if not exist "%%A" (
    echo  Bajando %%A ...
    curl -sSL -o "%%A" "{RAW.format(rama=rama, prod=prod, archivo='%%A')}"
  )
)

rem --- ffmpeg -------------------------------------------------------------
rem Se guarda al lado, sin instalar nada en el sistema ni tocar el PATH.
if not exist "ffmpeg.exe" (
  echo  Bajando ffmpeg ^(unos 80 MB, solo la primera vez^) ...
  curl -L -o ffmpeg.zip "{FFMPEG_ZIP}"
  echo  Descomprimiendo ...
  tar -xf ffmpeg.zip
  for /d %%D in (ffmpeg-master-*) do copy /y "%%D\\bin\\ffmpeg.exe" "ffmpeg.exe" >nul
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
echo  Montando {nV} planos - {fin} segundos - {W}x{H} @ {FPS}fps
echo  Tarda entre 5 y 15 minutos segun el PC. No cierres la ventana.
echo.

ffmpeg.exe -y ^
  {ins} ^
  -i "audio.mp3" ^
  -filter_complex_script "filtro.txt" ^
  -map "{salida_v}" -map {idx_audio}:a ^
  -t {fin} ^
  -c:v libx264 -preset medium -crf {CRF} -pix_fmt yuv420p -r {FPS} ^
  -c:a aac -b:a 192k -movflags +faststart ^
  "{cfg['salida']}"

if errorlevel 1 (
  echo.
  echo  El montaje ha fallado. Copia el error de arriba y mandalo.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo  LISTO: {cfg['salida']}
echo ============================================================
for %%F in ("{cfg['salida']}") do echo  Tamano: %%~zF bytes
echo.
pause
"""
    (prod_dir / "RENDERIZAR.bat").write_text(bat, encoding="utf-8", newline="\r\n")

    print(f"filtro.txt       {len(cadena):,} caracteres")
    print(f"RENDERIZAR.bat   {len(bat):,} caracteres")
    linea = bat[bat.index("ffmpeg.exe -y"):]
    print(f"linea de ffmpeg  {len(linea.replace(chr(10), '')):,} caracteres "
          f"(el limite de cmd.exe es 8191)")
    print(f"planos           {nV}  ·  {fin}s")


if __name__ == "__main__":
    main()
