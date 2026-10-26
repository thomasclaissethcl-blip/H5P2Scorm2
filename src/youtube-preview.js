/* Lecteur externe facultatif : aucune URL H5P arbitraire n'est insérée dans une iframe. */
(function(root) {
  'use strict';
  const ID = /^[A-Za-z0-9_-]{11}$/;
  const VIDEO_HOSTS = new Set(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com','youtu.be','www.youtu.be']);
  function videoId(candidate) {
    try {
      const url = new URL(String(candidate));
      if (url.protocol !== 'https:' || !VIDEO_HOSTS.has(url.hostname.toLowerCase()) || url.username || url.password || url.port) return null;
      const parts=url.pathname.split('/').filter(Boolean);
      let id;
      if (['youtu.be','www.youtu.be'].includes(url.hostname.toLowerCase())) id=parts[0];
      else if (parts[0] === 'watch') id=url.searchParams.get('v');
      else if (['embed','v','shorts','live'].includes(parts[0])) id=parts[1];
      return ID.test(id || '') ? id : null;
    } catch (_error) { return null; }
  }
  function findVideos(content) {
    const found=new Set();
    const seen=new WeakSet();
    const stack=[content];
    let visited=0;
    while (stack.length && visited<20000) {
      const obj=stack.pop(); visited++;
      if (!obj || typeof obj!=='object' || seen.has(obj)) continue;
      seen.add(obj);
      if (!Array.isArray(obj) && /video\/youtube/i.test(String(obj.mime||''))) {
        const id=videoId(obj.path);
        if (id) found.add(id);
      }
      for (const value of Object.values(obj)) if(value && typeof value==='object') stack.push(value);
    }
    return Array.from(found);
  }
  function embedUrl(id) {
    if (!ID.test(String(id))) return null;
    return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&playsinline=1';
  }
  function createController({wrap,links,surface,iframe,title,closeButton,consent}) {
    if (!wrap || !links || !surface || !iframe || !title || !closeButton || !consent) throw Error('Interface vidéo incomplète.');
    function close() {
      // Un iframe sans src n'accède jamais à YouTube et arrête la lecture.
      iframe.removeAttribute('src');
      surface.hidden = true;
    }
    closeButton.addEventListener('click',close);
    function render(content) {
      close();
      links.replaceChildren();
      const ids=findVideos(content);
      for (const [index,id] of ids.entries()) {
        const li=document.createElement('li');
        const button=document.createElement('button');
        button.type='button';
        button.textContent='Lire la vidéo '+(index+1)+' dans le convertisseur';
        button.disabled=!consent.checked;
        button.addEventListener('click',()=>{
          if(!consent.checked) return;
          const src=embedUrl(id);
          if(!src) return;
          iframe.src=src;
          title.textContent='Vidéo '+(index+1)+' (hors H5P)';
          surface.hidden=false;
        });
        const link=document.createElement('a');
        link.href='https://www.youtube.com/watch?v='+id;
        link.rel='noopener noreferrer';
        link.target='_blank';
        link.textContent='Ouvrir sur YouTube';
        li.append(button,link);
        links.appendChild(li);
      }
      wrap.hidden=ids.length===0;
    }
    consent.addEventListener('change',()=>{if(!consent.checked) close();});
    return {render,close};
  }
  root.H5PConverterModules=root.H5PConverterModules||{};
  root.H5PConverterModules.youtubePreview={videoId,findVideos,embedUrl,createController};
})(globalThis);
