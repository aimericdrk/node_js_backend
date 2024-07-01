var main_css = 'main_css_element';
if (!document.getElementById(main_css))
{
    document.getElementById("default_css").remove();   
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.id=main_css;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    if (document.cookie.includes("darkmode=true"))
        link.href = 'css/dark_mode.css';
    else
        link.href = 'css/main.css';
    link.media = 'all';
    head.appendChild(link);
}