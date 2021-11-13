/// wrapped into IIEF
(async () => {
  const postsPromise = fetchData('https://jsonplaceholder.typicode.com/posts');
  const usersPromise = fetchData('https://jsonplaceholder.typicode.com/users');
  const [posts, users] = await Promise.all([postsPromise, usersPromise]);

  const specifiedUser = getUserData(users, 'Ervin Howell');
  const [receivedUserPosts, restPosts] = divideUserPosts(posts, specifiedUser);
  const receivedComments = await receiveCommentsForPosts(receivedUserPosts);
  const postsWithComments = getPostsWithComments(receivedUserPosts, receivedComments);
  const mergedPosts = [...restPosts, ...postsWithComments];
  const usersWithPosts = getUsersWithPosts(users, mergedPosts);
  const formatedUsers = getFormateUsersData(usersWithPosts, {
    address: (data) => {
      const { city, street, suite } = data;
      return `${city}, ${street}, ${suite}`;
    },
    website: (data) => `https://${data}`,
    company: (data) => data.name,
    posts: (data) => {
      return data.map((post) => {
        const title_corp = `${post.title.slice(0, 20)}...`;
        return { ...omit(post, 'userId'), title_corp };
      });
    },
  });

  console.log(formatedUsers);
})();

function getFormateUsersData(users, rules) {
  const rulesKeys = Object.keys(rules);
  return users.map((user) => {
    const editedData = {};
    rulesKeys.every((keyName) => (user[keyName] ? (editedData[keyName] = rules[keyName](user[keyName])) : false));
    return { ...user, ...editedData };
  });
}

function getPostsWithComments(posts, comments) {
  return posts.reduce((acc, post) => {
    comments.some((commentGroup) => (commentGroup.postId === post.id ? acc.push({ ...post, comments: commentGroup.comments }) : false));
    return acc;
  }, []);
}

function getUsersWithPosts(users, posts) {
  return users.map((user) => {
    const usersPosts = posts.reduce((acc, post) => (user.id === post.userId ? acc.push({ ...post }) : false, acc), []);
    return { ...user, posts: usersPosts };
  });
}

async function receiveCommentsForPosts(posts) {
  return Promise.all(
    posts.map(async (post) => {
      const postData = await fetchData(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`);
      const comments = postData.map((comment) => omit(comment, 'postId'));
      return { postId: post.id, comments };
    })
  );
}

function divideUserPosts(posts, user) {
  return posts.reduce((acc, post) => (user.id === post.userId ? acc[0].push(post) : acc[1].push(post), acc), [[], []]);
}

function getUserData(users, name) {
  return users.find((user) => user.name === name);
}

async function fetchData(url, params) {
  const response = await fetch(url.toString(), params);
  if (response.ok) {
    return response.json();
  }
}

function omit(obj, ...fields) {
  const list = new Set(fields);
  return Object.entries(obj).reduce((acc, { 0: propName, 1: value }) => {
    if (!list.has(propName)) acc[propName] = value;
    return acc;
  }, {});
}
