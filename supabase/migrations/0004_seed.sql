-- MOMENTIA — datos iniciales

insert into public.products (slug, name, eyebrow, phrase, description, price_from, accent, includes, featured, sort_order)
values
  (
    'esencial',
    'Momentia Esencial',
    'Para empezar a sorprender',
    'Pequeños detalles. Grandes emociones.',
    'La forma más sencilla de decir lo que sientes: una caja cuidada, un detalle físico y una mini experiencia digital que se descubre al escanear un QR.',
    89,
    'rubi',
    array['Caja personalizada', 'Taza personalizada', 'Chocolates', 'Tarjeta', 'Fotografía', 'Decoración', 'Código QR', 'Mini experiencia digital'],
    false,
    1
  ),
  (
    'historia',
    'Momentia Historia',
    'Producto estrella',
    'Tu historia merece ser contada.',
    'La experiencia MOMENTIA completa: caja premium, carta personalizada, álbum digital, video y playlist. Todo lo que hace que un regalo continúe después de abrirlo.',
    139,
    'borgona',
    array['Caja premium', 'Producto personalizado', 'Chocolates', 'Fotografías', 'Carta personalizada', 'Detalle especial', 'Código QR', 'Álbum digital', 'Video', 'Playlist'],
    true,
    2
  ),
  (
    'corporate',
    'Momentia Corporate',
    'Para empresas',
    'Regalos que fortalecen equipos.',
    'Experiencias personalizadas para colaboradores y clientes: cumpleaños, reconocimientos, bienvenidas, aniversarios, navidad y eventos corporativos.',
    89,
    'dorado',
    array['Cumpleaños de colaboradores', 'Reconocimientos', 'Bienvenida', 'Aniversarios', 'Clientes especiales', 'Navidad', 'Eventos corporativos'],
    false,
    3
  )
on conflict (slug) do nothing;

insert into public.settings (key, value)
values
  ('delivery', jsonb_build_object(
    'zones', jsonb_build_array(
      jsonb_build_object('district', 'Lima (zonas céntricas)', 'cost', 12),
      jsonb_build_object('district', 'Lima (zonas periféricas)', 'cost', 18),
      jsonb_build_object('district', 'Callao', 'cost', 15),
      jsonb_build_object('district', 'Provincia (courier)', 'cost', 25)
    ),
    'freeAbove', 250
  )),
  ('launch_campaign', jsonb_build_object(
    'active', true,
    'title', 'LOS PRIMEROS 20 MOMENTIA',
    'message', 'Estamos creando algo diferente. Y queremos que seas de los primeros en vivirlo.',
    'offer', 'Las primeras experiencias incluyen un detalle digital especial.',
    'slotsLeft', 20
  ))
on conflict (key) do nothing;

-- Experiencia de demostración: /m/demo — para que el enlace "Ver experiencia" del
-- sitio funcione de inmediato sin depender de un pedido real.
insert into public.digital_experiences (
  code, slug, recipient_name, sender_name, intro_message, welcome_message, story, letter,
  final_message, privacy, status
) values (
  'DEMO001',
  'demo',
  'Ana',
  'Carlos',
  'Hay algo que quiero que recuerdes...',
  'Feliz de compartir contigo un pedacito de nuestra historia. Esto es solo el comienzo.',
  'Nos conocimos un martes cualquiera que terminó no siendo tan cualquiera. Desde entonces, cada momento contigo se ha convertido en una razón para sonreír.',
  'Querida Ana:\n\nHay cosas que no caben dentro de una caja. Esta es una de ellas. Gracias por cada risa, cada silencio cómodo y cada plan improvisado.\n\nCon todo mi cariño,\nCarlos',
  'Este regalo termina aquí. El momento, no. ❤️',
  'public',
  'publicada'
)
on conflict (slug) do nothing;

insert into public.experience_music (experience_id, option, title, artist, spotify_embed_url)
select id, 'spotify', 'Perfect', 'Ed Sheeran', 'https://open.spotify.com/embed/track/0tgVpDi06FyKpA1z0VMD4v'
from public.digital_experiences where slug = 'demo'
on conflict do nothing;
