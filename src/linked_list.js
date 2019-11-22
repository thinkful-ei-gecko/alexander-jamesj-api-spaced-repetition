class LinkedList {
  constructor() {
    this.head = null
  }

  insertFirst(value) {
    if (this.head === null) {
      this.head = new _Node(value, null)
    } else {
      let tempWord = this.head
      this.head = new _Node(value, this.head)
      this.head.next = tempWord
    }
  }

  insertLast(value) {
    if (this.head === null) {
      this.insertFirst(value)
    } else {
      let tempNode = this.head
      while (tempNode.next !== null) {
        tempNode = tempNode.next
      }
      tempNode.next = new _Node(value, null)
    }
  }

  insertAtDepth(value, depth) {
    if (this.head === null) {
      this.insertFirst(value)
    } else {
      let counter = depth
      let prevNode = null
      let currNode = this.head
      while (currNode && counter > 0) {
        prevNode = currNode
        currNode = currNode.next
        counter--
      }
      if (!currNode) {
        this.insertLast(value)
      } else {
        let newNode = new _Node(value, currNode)
        prevNode.next = newNode
      }
    }
  }
}

class _Node {
  constructor(value = null, next = null) {
    ;(this.value = value), (this.next = next)
  }
}

module.exports = LinkedList
