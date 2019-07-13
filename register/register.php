<html><script src="https://cdn.jsdelivr.net/npm/sweetalert2@8"></script></html>

<?php
header('X-Powered-By: Action Message Format 3');
//error_reporting(0);

$config = new stdClass();
$config->host = '127.0.0.1';
$config->database = 'quasar';
$config->username = 'root';
$config->password = '';
$config->loginKey = 'Quasar';

function encryptPassword($strPassword, $md5 = true) {
  $strPassword = $md5 ? md5($strPassword) : $strPassword;

  return substr($strPassword, 16, 16) . substr($strPassword, 0, 16);
}

function getLoginHash($strPassword, $loginKey) {
  return password_hash(encryptPassword(encryptPassword($strPassword, false) . $loginKey . 'Y(02.>\'H}t":E1'), PASSWORD_BCRYPT, ['cost' => 12]);
}

function validateData() {
  if (!empty($_POST)) {
    $p = $_POST;

    if (isset($p['username'], $p['password'], $p['color'])) {
      if (!empty($p['username']) && !empty($p['password']) && !empty($p['color']) && !is_nan($p["color"])) {
        if (preg_match('/^[a-zA-Z0-9 ]{4,12}+$/', $p['username']) && strlen($p['password']) >= 4 && strlen($p['password']) <= 12) {
          if ((int)$p["color"] >= 1 && (int)$p["color"] <= 16) {
            return true;
          }
        }
      }
    }
  }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!validateData()) {
    die();
  } else {
    try {
      $strUsername = $_POST['username'];
      $strPassword = $_POST['password'];
      $intColor = (int)$_POST['color'];

      $db = new PDO('mysql:host='.$config->host.';dbname='.$config->database, $config->username, $config->password);
      $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
      $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

      $usernameExists = $db->prepare('SELECT username FROM penguins WHERE username = :username');
      $usernameExists->bindValue(':username', $strUsername);
      $usernameExists->execute();
      $usernameExists->closeCursor();

      if ($usernameExists->rowCount() === 0) {
        $strHash = getLoginHash(strtoupper(hash('md5', $strPassword)), $config->loginKey);

        $insertPenguin = $db->prepare('INSERT INTO penguins (username, password, color) VALUES (:username, :password, :color)');
        $insertPenguin->bindValue(':username', $strUsername);
        $insertPenguin->bindValue(':password', $strHash);
        $insertPenguin->bindValue(':color', $intColor);
        $insertPenguin->execute();
        $insertPenguin->closeCursor();

        echo '<script>Swal.fire("Registered", "Your penguin is registered.", "success")</script>';
      } else {
        echo '<script>Swal.fire("Failed", "Your penguin is already registered.", "error")</script>';
      }
    } catch (\PDOException $err) {
      throw new \PDOException($err->getMessage(), $err->getCode());
    }
  }
}

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html lang="en">

<head>
  <title>Register</title>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
  <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>

  <script type="text/javascript">
    function randomTip() {
      var tips = [
        'Never share your password with anyone.',
        'Never use the same password.',
        'A random password is a happy password.',
        'Your password can contain a max length of 12.',
        'Special characters are special.',
        'Capital letters are letters as well.',
        'Numbers are kind of special.',
        'You can choose which color your penguin will be.'
      ];

      document.getElementById('tip').innerHTML = tips[Math.floor(Math.random() * tips.length)];
    }
  </script>

  <style>body {font-family: 'Roboto', sans-serif;font-size: 15px;}</style>
</head>

<body background="assets/bg.jpg" onload="randomTip();">
  <section id="cover">
    <div id="cover-caption">
      <div id="container" class="container">
        <div class="row text-white">
          <div class="col-sm-6 offset-sm-3 text-center">
            <h1 class="display-4">Register your penguin</h1>
            <div class="info-form">
              <form action="" method="POST"
                class="form-inlin justify-content-center shadow-lg p-3 mb-5 bg-white rounded">
                <div class="form-group">
                  <input type="text" name="username" class="form-control" placeholder="Username" minlength="4"
                    maxlength="12" required>
                </div>

                <div class="form-group">
                  <input type="password" name="password" class="form-control" placeholder="Password" minlength="4"
                    maxlength="12" required>
                </div>

                <div class="form-group">
                  <select class="form-control" name="color" required>
                    <option value="1">Blue</option>
                    <option value="2">Green</option>
                    <option value="3">Pink</option>
                    <option value="4">Black</option>
                    <option value="5">Red</option>
                    <option value="6">Orange</option>
                    <option value="7">Yellow</option>
                    <option value="8">Dark Purple</option>
                    <option value="9">Brown</option>
                    <option value="10">Peach</option>
                    <option value="11">Dark Green</option>
                    <option value="12">Light Blue</option>
                    <option value="13">Lime Green</option>
                    <option value="14">Sensei Gray</option>
                    <option value="15">Aqua</option>
                    <option value="16">Arctic White</option>
                  </select>
                </div>

                <div class="alert alert-success" id="tip" role="alert"></div>

                <button type="submit" class="btn btn-primary">Register</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</body>

</html>
