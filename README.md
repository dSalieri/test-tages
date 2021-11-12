# test-tages

## Тестовое задание на вакансию JavaScript разработчик

**Задача:**

Воспользовавшись открытыми JSON REST API-точками для получения списка постов
http://jsonplaceholder.typicode.com/posts и списка пользователей
http://jsonplaceholder.typicode.com/users, сформировать и вывести в консоль итоговый
массив пользователей из 10 элементов следующего вида (учитывая комментарии):

```JavaScript
[
  {
    id: 1,
    name: "Leanne Graham",
    email: "Sincere@april.biz",
    address: "Gwenborough, Kulas Light, Apt. 556", // объединение полей city, street, suit
    website: "https://hildegard.org", // добавление статичного протокола "https://" для корректной работы ссылки
    company: "Romaguera-Crona", // только поле name
    posts: [
      {
        id: 1,
        title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        title_crop: "sunt aut facere repe...", // короткий заголовок (20 символов + троеточие)
        body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto",
      },
      ...
    ],
  },
  ...
];
```

**Бонус:**
Для пользователя "Ervin Howell" все его посты обогатить соответствующими комментариями. Комментарии можно получить при помощи точек http://jsonplaceholder.typicode.com/posts/${postId}/comments, например, http://jsonplaceholder.typicode.com/posts/1/comments.

## Решение

Находится в `index.js`
