  $(function() {
    $(".badge").replaceWith('<span class="badge">' + $.jStorage.get("all", []).length + '</span>');
  });