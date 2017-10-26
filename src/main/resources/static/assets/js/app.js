$(function () {
  $('#doc-form-file').on('change', function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    if (file && file.type.match('image.*')) {
      reader.readAsDataURL(file);
    } else {
      return false;
    }
    reader.onload = function (e) {
      var data = e.target.result,
        image = new Image();

      image.src = data;
      image.onload = function () {
        WaterMark.mark({
          text: "此证件仅供办理xx业务使用，他用无效",
          id: "myCanvas",
          color: '#fff',
          xStart: 0,
          yStart: -1000,
          xSpace: 20,
          ySpace: 30,
          size: 18,
          rotate: 45,
          opacity: 0.8,
          width: image.width,
          height: image.height,
          imgUrl: data
        });
      };
    }
  });

  $('#download').on('click', function () {
    downloadCanvas(this, 'myCanvas', 'test.png');
  });

  function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
  }
});