const fs = require("fs");
const xml2js = require("xml2js");
const fetch = require("cross-fetch");
const parser = new xml2js.Parser();

fs.readFile("sitemap-sample.xml", (err, data) => {
  if (err) throw new Error("read file error");

  parser.parseString(data, (err, result) => {
    const urls = result["urlset"]["url"];

    let errorArray = [];
    let successCount = 0;
    let errCount = 0;

    const promises = urls.map(
      (u, i) =>
        new Promise((resolve, reject) =>
          setTimeout(() => {
            const url = u.loc[0];

            fetch(url)
              .then((res) => {
                if (res.status >= 400) {
                  throw new Error("Bad response from server");
                }

                console.log(i, url);
                successCount++;
                resolve();
              })
              .catch((err) => {
                console.error("error", url);
                errorArray.push(url);
                errCount++;
                resolve();
              });
          }, 5000 * i)
        )
    );

    Promise.all(promises)
      .then(() => {
        if (errorArray && errorArray.length) {
          fs.writeFile("errorLog.txt", errorArray.join(","), (err) => {
            //
          });
        }
      })
      .catch((perror) => {
        console.log(errorArray);
      })
      .finally(() => {
        console.log("done");
        console.log("success = ", successCount);
        console.log("error = ", errCount);
      });
  });
});
