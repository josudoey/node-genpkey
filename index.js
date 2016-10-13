var spawn = require("child_process").spawn;
var cert = require('crypto').Certificate();

var exports = module.exports = function () {

};

var genPrivateKey = function (opts) {
  var algo = "RSA";
  var bitLen = 1024;
  var cmd = "openssl";
  var args = ["genpkey", "-algorithm", algo, "-pkeyopt", "rsa_keygen_bits:" + bitLen, "/dev/stdout"];
  return new Promise(function (resolve, reject) {
    var proc = spawn(cmd, args, {
      stdio: ['ignore', 'pipe', 'ignore']
    });
    proc.on("exit", function (exitCode) {
      if (exitCode) {
        reject(new Error("openssl generate private key fail"));
      }
    });
    var stack = [];
    proc.stdout.on("data", function (buf) {
      stack.push(buf);
    });
    proc.stdout.on("close", function () {
      resolve(Buffer.concat(stack).toString())
    });
  });
}

var genPublicKey = function (priKey, opts) {
  var cmd = "bash";
  var args = ["-c", "openssl rsa -in /dev/stdin -pubout -out /dev/stdout"];
  var args = ["-c", "cat |openssl rsa -in /dev/stdin -pubout -out /dev/stdout|cat"];
  return new Promise(function (resolve, reject) {
    var proc = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'ignore']
    });
    proc.stdin.write(priKey);
    proc.stdin.destroy();
    proc.on("exit", function (exitCode) {
      if (exitCode) {
        reject(new Error("openssl generate public key fail"));
      }
    });
    var stack = [];
    proc.stdout.on("data", function (buf) {
      stack.push(buf);
    });

    proc.stdout.on("close", function () {
      resolve(Buffer.concat(stack).toString())
    });
  });
}

var exports = module.exports = function () {

}

exports.genpkeyAsync = function () {
  var ctx = {};
  return genPrivateKey().then(function (priKey) {
    ctx.private = priKey;
    return genPublicKey(priKey);
  }).then(function (pubKey) {
    ctx.public = pubKey;
    return Promise.resolve(ctx);
  })
}

