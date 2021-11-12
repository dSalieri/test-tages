/// wrapped into IIEF
(async () => {
  const postsPromise = fetchData('https://jsonplaceholder.typicode.com/posts');
  const usersPromise = fetchData('https://jsonplaceholder.typicode.com/users');
  const [posts, users] = await Promise.all([postsPromise, usersPromise]);

  const formatedUsers = formateUsersData(posts, users);
  const usersWithPostComments = await addCommentsToUserPosts(formatedUsers, 'Ervin Howell');

  console.log(usersWithPostComments);
})();

function formateUsersData(posts, users) {
  return users.reduce((acc, item) => {
    const itemRecord = {};

    if (item.hasOwnProperty('address')) {
      const { city, street, suite } = item.address;
      itemRecord.address = `${city}, ${street}, ${suite}`;
    }
    if (item.hasOwnProperty('website')) {
      itemRecord.website = `https://${item.website}`;
    }
    if (item.hasOwnProperty('company')) {
      itemRecord.company = item.company.name;
    }
    const postRecord = posts.reduce((acc, post) => {
      if (item.id === post.userId) {
        const { id, title, body } = post;
        const title_corp = `${title.slice(0, 20)}...`;
        acc.push({ id, title, title_corp, body });
      }
      return acc;
    }, []);
    return acc.push({ ...item, ...itemRecord, posts: [...postRecord] }), acc;
  }, []);
}

async function addCommentsToUserPosts(users, name) {
  return Promise.all(
    users.map(async (user) => {
      if (user.name === name) {
        if (Array.isArray(user.posts)) {
          const posts = await Promise.all(
            user.posts.map(async (post) => {
              const commentsData = await fetchData(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`);
              const comments = commentsData.map((comment) => omit(comment, 'postId'));
              return { ...post, comments };
            })
          );
          return { ...user, posts };
        }
      }
      return user;
    })
  );
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
