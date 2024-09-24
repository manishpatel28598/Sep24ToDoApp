window.onload = generateTodos();
// window.onload = getProfile();

function generateTodos() {
  axios
    .get("/read-item")
    .then((res) => {
      // console.log(res.data);
      if (res.data.status !== 200) {
        alert(res.data.message);
        return;
      }
      const todos = res.data.data;
      // console.log("todos", todos);
      document.getElementById("item_id").insertAdjacentHTML(
        "beforeend",
        todos
          .map((item) => {
            console.log("item", item);
            return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text"> ${item.todo}</span>
            <div>
                <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
            </li>`;
          })
          .join(" ")
      );
    })

    .catch((err) => console.log(err));
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-me")) {
    console.log("edit is clicked");
    if (event.target.classList.contains("edit-me")) {
      const todoId = event.target.getAttribute("data-id");
      const newData = prompt("Enter new todo Text");
      console.log(newData);
      axios
        .post("/edit-item", { newData, todoId })
        .then((res) => {
          if (res.data.status !== 200) {
            alert(res.data.message);
            return;
          }
          console.log("event", event);
          event.target.parentElement.parentElement.querySelector(
            ".item-text"
          ).innerHTML = newData;
        })
        .catch((err) => console.log(err));
    }
  } 
  else if (event.target.classList.contains("delete-me")) {
    console.log("delete is clicked");
    const todoId = event.target.getAttribute("data-id");

    axios.post("/delete-item", {todoId}).then((res)=>{
        if(res.data.status !== 200){
            alert(res.data.message);
            return;
        }
        event.target.parentElement.parentElement.remove();
    })
    .catch((err)=>console.log(err));
  }
  else if(event.target.classList.contains('add_item')){
      console.log(document.getElementById("create_field").value);

      const todo = document.getElementById("create_field").value

      axios.post('/create-item', {todo}).then((res)=>{
        if(res.data.status !== 201){
            alert(res.data.message)
            return;
        }

        document.getElementById("create_field").value = "";

        document.getElementById("item_id").insertAdjacentHTML(
            "beforeend",
                `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
                <span class="item-text"> ${res.data.data.todo}</span>
                 <div>
                    <button data-id="${res.data.data._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                    <button data-id="${res.data.data._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
                </div>
                </li>`
              );
      })
      .catch((err)=>console.log(err));

  }
  else if(event.target.classList.contains('logout-me')){
    axios.post("/logout").then((res)=>{
      if(res.status !== 200){
        alert(res.data);
        return;
      }

      windows.location.href = '/login'

    })
    .catch((err)=>console.log(err));
  }
});
