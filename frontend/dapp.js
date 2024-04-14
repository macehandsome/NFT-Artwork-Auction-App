// @TODO: Update this address to match your deployed ArtworkMarket contract!
// const contractAddress = "0x7a377fAd8c7dB341e662c93A79d0B0319DD3DaE8";
const contractAddress = "0x75F0ab92dD3023CF6B989921ed5b774E7a3d6184";


const dApp = {
  ethEnabled: function() {
    // If the browser has an Ethereum provider (MetaMask) installed
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }
    return false;
  },

  //async function enable asynchronous, promise-based behavior to be written in a cleaner style
  collectVars: async function() {
    // get land tokens
    this.tokens = [];
    this.totalSupply = await this.artContract.methods.totalSupply().call();

    // fetch json metadata from IPFS (name, description, image, etc)
    const fetchMetadata = (reference_uri) => fetch(`https://gateway.pinata.cloud/ipfs/${reference_uri.replace("ipfs://", "")}`, { mode: "cors" }).then((resp) => resp.json());

    for (let i = 1; i <= this.totalSupply; i++) {
      try {
        const token_uri = await this.artContract.methods.tokenURI(i).call();
        const art_name = await this.artContract.methods.tokenURI(i).call();
        console.log('token uri', token_uri)
        const token_json = await fetchMetadata(token_uri);
        console.log('token json', token_json)
        this.tokens.push({
          tokenId: i,
          highestBid: Number(await this.artContract.methods.highestBid(i).call()),
          auctionEnded: Boolean(await this.artContract.methods.auctionEnded(i).call()),
          pendingReturn: Number(await this.artContract.methods.pendingReturn(i, this.accounts[0]).call()),
          auction: new window.web3.eth.Contract(
            this.auctionJson,
            await this.artContract.methods.auctions(i).call(),
            { defaultAccount: this.accounts[0] }
          ),
          owner: await this.artContract.methods.ownerOf(i).call(),
          startTime: await this.artContract.methods.getStartTime(i).call(),
          expiryTime: await this.artContract.methods.getExpiryTime(i).call(),
          ...token_json
        });
      } catch (e) {
        console.log("ERROR 2", e);
        console.log(JSON.stringify(e));
      }
    }
  },
  setAdmin: async function() {
    // if account selected in MetaMask is the same as owner then admin will show
    if (this.isAdmin) {
      $(".dapp-admin").show();
    } else {
      $(".dapp-admin").hide();
    }
  },
  updateUI: async function() {
    console.log("updating UI");
    // refresh variables
    await this.collectVars();
    console.log("haha");
 
    $("#dapp-tokens").html("");
    this.tokens.forEach((token) => {
      try {
        let endAuction = `<a token-id="${token.tokenId}" class="dapp-admin btn btn-info" style="display:none;" href="#" onclick="dApp.endAuction(event)">End Auction</a>`;
        let highestBidder = `: ${token.owner}`;
        let highestBid = `  ${token.highestBid}`;
        let auctionStatus = `   ${token.auctionEnded}`;
        console.log("token", token);
        console.log(token.startTime, typeof(token.startTime));
        console.log(token.expiryTime, typeof(token.expiryTime));
        let startTimeStr = new Date(Number(token.startTime) * 1000).toString();
        let expiryTimeStr = new Date(Number(token.expiryTime) * 1000).toString();
        console.log(startTimeStr, typeof(startTimeStr));
        console.log(expiryTimeStr, typeof(expiryTimeStr));
        
        
        // if (hour < 18) {
        //   greeting = "Good day";
        // }
        console.log("heihei");
         
        let bid = `<a token-id="${token.tokenId}" href="#" class="btn btn-info" onclick="dApp.bid(event);">Bid</a>`;
        let owner = `Final Artwork Owner: ${token.owner}`;
        let URL = `Final Artwork Owner: ${token.URL}`;
        /* console.log('owner', owner) */
        let withdraw = `<a token-id="${token.tokenId}" href="#" class="btn btn-info" onclick="dApp.withdraw(event)">Withdraw</a>`
        let pendingWithdraw = `Balance: ${token.pendingReturn} wei`;

          $("#dapp-tokens").append(
            `<div class="col m6">
              <div class="card cardsize">
                <div class="card-image">
                  <img id="dapp-image" src="https://gateway.pinata.cloud/ipfs/${token.image.replace("ipfs://", "")}">
                  <span id="dapp-name" class="card-title">${token.name}</span>
                </div>
                <div class="card-action">
                <h6> Bid: </h6>
                  <input type="number" min="${token.highestBid + 1}" name="dapp-wei" value="${token.highestBid + 1}" ${token.auctionEnded ? 'disabled' : ''}>
                  ${token.auctionEnded ? owner : bid}
                  ${token.pendingReturn > 0 ? withdraw : ''}
                  ${this.isAdmin && !token.auctionEnded ? endAuction : ''} <br>
                  ${token.pendingReturn > 0 ? pendingWithdraw : ''}
                <p> Auction Start Time: ${startTimeStr} </p>
                <p> Auction Expiry Time: ${expiryTimeStr} </p>
                </div>
              </div>
            </div>`
          );
          // console.log('i one per image', i)
    /*     console.log('highestBidder', highestBidder)
        console.log('highestBid', highestBid)
        console.log('auctionStatus', auctionStatus)
        console.log('owner', owner) */

          $("#dapp-auc-details").append(
            `    <div class="card blue darken- ">
            <div class="card-content white-text ">
          
           

   <p class="card-header white-text bg-light text-dark mb-3 "> AUCTION DETAILS FOR:  ${token.name}</p>          
  <table class="table ">
  <thead>
    <tr>
       
       
       
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Auction Highest Bid: ${highestBid} wei </td>
       
       
    </tr>
    <tr>
      <td>Auction Highest Bidder: ${ highestBidder }</td>
       
       
    </tr>
    <tr>
      <td>Auction Ended? ${ auctionStatus}</td>
       
       
    </tr>
      <tr>
      <td> Image Pinata IPFS URI: 
      <a class="white-text h1 small" style=font-size:8px, href="https://gateway.pinata.cloud/ipfs/${token.image.replace("ipfs://", "")} ">
            https://gateway.pinata.cloud/ipfs/${token.image.replace("ipfs://", "")} 
            </a>
      
      </td>
       
       
    </tr>
  </tbody>
</table>
</div>   
</div> 

               `
          );
      } catch (e) {
        alert(JSON.stringify(e));
      }
    });

    // hide or show admin functions based on contract ownership
    this.setAdmin();
  },
  bid: async function(event) {
    const tokenId = $(event.target).attr("token-id");
    const wei = Number($(event.target).prev().val());
    await this.artContract.methods.bid(tokenId).send({from: this.accounts[0], value: wei}).on("receipt", async (receipt) => {
      M.toast({ html: "Transaction Mined! Refreshing UI..." });
      await this.updateUI();
    });
  },
  endAuction: async function(event) {
    const tokenId = $(event.target).attr("token-id");
    await this.artContract.methods.endAuction(tokenId).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
      M.toast({ html: "Transaction Mined! Refreshing UI..." });
      await this.updateUI();
    });
  },
  withdraw: async function(event) {
    const tokenId = $(event.target).attr("token-id") - 1;
    await this.tokens[tokenId].auction.methods.withdraw().send({from: this.accounts[0]}).on("receipt", async (receipt) => {
      M.toast({ html: "Transaction Mined! Refreshing UI..." });
      await this.updateUI();
    });
  },
  registerArt: async function() {
    const name = $("#dapp-register-name").val();
    const image = document.querySelector('input[type="file"]');

    const pinata_api_key = $("#dapp-pinata-api-key").val();
    const pinata_secret_api_key = $("#dapp-pinata-secret-api-key").val();

    const raw_expiry_date = $("#dapp-expiry-date").val();
    const raw_expiry_time = $("#dapp-expiry-time").val();

    let expiry_timestamp = 9876543210;

    console.log("raw_expiry_date", raw_expiry_date, typeof(raw_expiry_date));
    console.log("raw_expiry_time", raw_expiry_time, typeof(raw_expiry_time));
    try{
      let date_list = raw_expiry_date.split("-");
      let time_list = raw_expiry_time.split(":");
      let expiry_datetime = new Date(date_list[0], date_list[1] - 1, date_list[2], time_list[0], time_list[1], 0);
      expiry_timestamp = expiry_datetime.getTime() / 1000;
    }
    catch(err){
      console.log("Error parsing expiry date and time", err);
      console.log("raw_expiry_date 2", raw_expiry_date, typeof(raw_expiry_date));
      console.log("raw_expiry_time 2", raw_expiry_time, typeof(raw_expiry_time));
    }

    if (!pinata_api_key || !pinata_secret_api_key || !name || !image) {
      M.toast({ html: "Please fill out then entire form!" });
      return;
    }

    const image_data = new FormData();
    image_data.append("file", image.files[0]);
    image_data.append("pinataOptions", JSON.stringify({cidVersion: 1}));

    try {
      M.toast({ html: "Uploading Image to IPFS via Pinata..." });
      const image_upload_response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        mode: "cors",
        headers: {
          pinata_api_key,
          pinata_secret_api_key
        },
        body: image_data,
      });

      const image_hash = await image_upload_response.json();
      const image_uri = `ipfs://${image_hash.IpfsHash}`;

      M.toast({ html: `Success. Image located at ${image_uri}.` });
      M.toast({ html: "Uploading JSON..." });

      
      const reference_json = JSON.stringify({
        pinataContent: { name, image: image_uri },
        pinataOptions: {cidVersion: 1}
      });

      const json_upload_response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key,
          pinata_secret_api_key
        },
        body: reference_json
      });

      const reference_hash = await json_upload_response.json();
      const reference_uri = `ipfs://${reference_hash.IpfsHash}`;

      M.toast({ html: `Success. Reference URI located at ${reference_uri}.` });
      M.toast({ html: "Sending to blockchain..." });

      console.log("expiry_timestamp", expiry_timestamp, typeof(expiry_timestamp));
      console.log("reference_uri",reference_uri, typeof(reference_uri));
      console.log("this.accounts[0]",this.accounts[0], typeof(this.accounts[0]));

      await this.artContract.methods.registerArt(reference_uri, expiry_timestamp).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
        M.toast({ html: "Transaction Mined! Refreshing UI..." });
        $("#dapp-register-name").val("");
        $("#dapp-register-image").val("");
        await this.updateUI();
      });

    } catch (e) {
      console.log("error", e);
      alert("ERROR:", JSON.stringify(e));
    }
  },
  main: async function() {
    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    this.accounts = await window.web3.eth.getAccounts();
    this.contractAddress = contractAddress;

    this.artJson = await (await fetch("./ArtworkMarket.json")).json();
    this.auctionJson = await (await fetch("./ArtworkAuction.json")).json();

    this.artContract = new window.web3.eth.Contract(
      this.artJson,
      this.contractAddress,
      { defaultAccount: this.accounts[0] }
    );
    console.log("Contract object", this.artContract);

    this.isAdmin = this.accounts[0] == await this.artContract.methods.owner().call();

    await this.updateUI();
  }
};

dApp.main();

// for mouse Animation
document.addEventListener('DOMContentLoaded', function() {
  const maxTrails = 15; // Maximum number of trails on screen
  const trailLife = 200; // Lifetime of each trail in milliseconds
  let trails = []; // Store active trail elements
  let stationaryTrail; // Stationary circle under the cursor

  document.body.addEventListener('mousemove', function(e) {
      if (!stationaryTrail) {
          // Create stationary circle if it doesn't exist
          stationaryTrail = createTrail(e.pageX, e.pageY);
          stationaryTrail.style.opacity = 1; // Ensure visibility
          document.body.appendChild(stationaryTrail);
      } else {
          // Update stationary circle's position
          stationaryTrail.style.left = e.pageX + 'px';
          stationaryTrail.style.top = e.pageY + 'px';
      }

      // Create moving trail
      const trail = createTrail(e.pageX, e.pageY);
      document.body.appendChild(trail);
      trails.push(trail);
      
      // Limit number of trails on screen
      while (trails.length > maxTrails) {
          const oldTrail = trails.shift();
          // Prevent removal of stationary circle
          if (oldTrail !== stationaryTrail) {
              oldTrail.parentElement.removeChild(oldTrail);
          }
      }

      // Animate moving trail
      animateTrail(trail, e.pageX, e.pageY);
  });

  function createTrail(x, y) {
      const trail = document.createElement('div');
      trail.className = 'trail'; // Assign class for styling
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';

      trail.style.marginLeft = '-10px'; // Half of the width
      trail.style.marginTop = '-10px'; // Half of the height
      return trail;
  }

  function animateTrail(trail, x, y) {
      let startTime = performance.now();

      function animation(time) {
          if (trail === stationaryTrail) return; // Skip animation for stationary circle

          // const elapsedTime = time - startTime;
          // const progress = elapsedTime / trailLife;
          // const opacity = Math.max(1 - progress, 0); // Fade effect
          // // Color transition from white to blue
          // const colorProgress = Math.min(progress * 2, 1); // Complete change halfway through lifetime
          // trail.style.backgroundColor = `rgba(${255 * (1 - colorProgress)}, ${255 * (1 - colorProgress)}, 255, ${opacity})`;
          const elapsedTime = time - startTime;
          const progress = elapsedTime / trailLife;
          const opacity = Math.max(1 - progress, 0);
          const colorProgress = Math.min(progress * 2, 1); 

          trail.style.opacity = opacity;
          trail.style.backgroundColor = `rgba(${255 * (1 - colorProgress)}, ${255 * colorProgress}, 255, ${opacity})`;
          trail.style.opacity = opacity;

          if (opacity > 0) {
              requestAnimationFrame(animation);
          } else {
              // Remove trail after animation, except stationary circle
              if (trail !== stationaryTrail) {
                  trail.parentElement.removeChild(trail);
              }
          }
      }

      requestAnimationFrame(animation);
  }

  const buttons = document.querySelectorAll('.btn');

  // Function to enlarge the stationary circle
  function enlargeCircle() {
      if (stationaryTrail) {
          stationaryTrail.style.width = '30px'; // Double the size or adjust as needed
          stationaryTrail.style.height = '30px';
          stationaryTrail.style.marginLeft = '-15px'; // Adjust to keep the circle centered
          stationaryTrail.style.marginTop = '-15px';
          stationaryTrail.style.backgroundColor = '#FF4081'; // Change color
          stationaryTrail.style.opacity = '0.5'; // Change to semi-transparent
      }
  }

  // Function to reset the circle's size
  function resetCircleSize() {
      if (stationaryTrail) {
          stationaryTrail.style.width = '20px'; // Original size
          stationaryTrail.style.height = '20px';
          stationaryTrail.style.marginLeft = '-10px'; // Original margin adjustment
          stationaryTrail.style.marginTop = '-10px';
      }
  }

  // Add event listeners to buttons
  buttons.forEach(button => {
      button.addEventListener('mouseover', enlargeCircle);
      button.addEventListener('mouseout', resetCircleSize);
  });
});